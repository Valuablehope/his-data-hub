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

const tables = ["Users", "Documents", "ActivityForms", "UploadedFiles", "DataFlows"];

async function exportData() {
  try {
    console.log(`Connecting to database ${config.database} on ${config.server}...`);
    await sql.connect(config);
    
    const dump = {};
    
    for (const table of tables) {
      console.log(`Exporting table: ${table}...`);
      try {
        const result = await sql.query(`SELECT * FROM ${table}`);
        dump[table] = result.recordset;
        console.log(`  -> Exported ${result.recordset.length} rows.`);
      } catch (e) {
        console.warn(`  -> Skipping ${table}: ${e.message}`);
      }
    }
    
    fs.writeFileSync('db_dump.json', JSON.stringify(dump, null, 2));
    console.log('Successfully exported all data to db_dump.json');
    console.log('You should copy db_dump.json and the /uploads folder to your remote PC.');
    
  } catch (err) {
    console.error('Export Failed:', err);
  } finally {
    process.exit(0);
  }
}

exportData();
