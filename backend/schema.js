const {poolPromise} = require('./db');
poolPromise.then(pool => pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'"))
.then(r => { console.log(r.recordset); process.exit(0); })
.catch(console.error);
