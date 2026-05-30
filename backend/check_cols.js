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

async function checkCols() {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'UploadedFiles'
    `);
    console.log(JSON.stringify(result.recordset));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkCols();
