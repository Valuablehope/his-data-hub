const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Divine_the_Legend007',
  server: '192.168.5.1', // The IP they used for their frontend API url
  database: 'HISDataHub',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function test() {
  try {
    await sql.connect(config);
    const result = await sql.query('SELECT 1 as result');
    console.log('SUCCESS');
  } catch (err) {
    console.error('FAILED TO CONNECT WITH IP:', err.message);
    try {
      config.server = 'Health-HIS-WS\\SQLEXPRESS';
      await sql.connect(config);
      console.log('SUCCESS with Health-HIS-WS\\SQLEXPRESS');
    } catch(err2) {
      console.error('FAILED TO CONNECT WITH HOSTNAME:', err2.message);
    }
  } finally {
    process.exit(0);
  }
}
test();
