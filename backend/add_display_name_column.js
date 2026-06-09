const { poolPromise, sql } = require('./db');

async function addDisplayNameColumn() {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF COL_LENGTH('Users', 'DisplayName') IS NULL
            BEGIN
                ALTER TABLE Users
                ADD DisplayName VARCHAR(100) NULL;
            END
        `);
        
        await pool.request().query(`
            UPDATE Users SET DisplayName = Username WHERE DisplayName IS NULL;
        `);
        console.log('Successfully added DisplayName column to Users table.');
        process.exit(0);
    } catch (err) {
        console.error('Error adding column:', err);
        process.exit(1);
    }
}

addDisplayNameColumn();
