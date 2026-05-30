require('dotenv').config();
const sql = require('mssql');

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

async function listTables() {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log(JSON.stringify(result.recordset.map(r => r.TABLE_NAME)));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
listTables();
