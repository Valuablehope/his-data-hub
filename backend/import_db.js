require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function importData() {
  if (!fs.existsSync('db_dump.json')) {
    console.error('Error: db_dump.json not found. Please copy it from your local machine.');
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));

  try {
    console.log(`Connecting to database ${config.database} on ${config.server}...`);
    const pool = await sql.connect(config);

    // Import order (deal with constraints if any, though here we just do standard)
    const tables = ["Users", "Documents", "ActivityForms", "UploadedFiles", "DataFlows"];

    for (const table of tables) {
      if (!dump[table] || dump[table].length === 0) continue;
      
      console.log(`Importing table: ${table}...`);
      
      const records = dump[table];
      const columns = Object.keys(records[0]);
      const hasId = columns.includes('Id');
      
      // Clear existing table
      console.log(`  -> Clearing existing data in ${table}...`);
      await pool.request().query(`DELETE FROM ${table}`);



      for (const record of records) {
        const request = pool.request();
        const colNames = [];
        const paramNames = [];

        columns.forEach((col) => {
            colNames.push(col);
            paramNames.push('@' + col);
            // Handle nulls and dates properly
            request.input(col, record[col]);
        });

        let query = `INSERT INTO ${table} (${colNames.join(', ')}) VALUES (${paramNames.join(', ')})`;
        if (hasId) {
          query = `IF OBJECTPROPERTY(OBJECT_ID('${table}'), 'TableHasIdentity') = 1 SET IDENTITY_INSERT ${table} ON; ` + 
                  query + 
                  `; IF OBJECTPROPERTY(OBJECT_ID('${table}'), 'TableHasIdentity') = 1 SET IDENTITY_INSERT ${table} OFF;`;
        }
        await request.query(query);
      }


      
      console.log(`  -> Imported ${records.length} rows into ${table}.`);
    }

    console.log('Successfully imported all data!');
    
  } catch (err) {
    console.error('Import Failed:', err);
  } finally {
    process.exit(0);
  }
}

importData();
