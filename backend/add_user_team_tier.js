const { poolPromise } = require('./db');

async function addUserTeamTier() {
    try {
        const pool = await poolPromise;

        await pool.request().query(`
            IF COL_LENGTH('Users', 'TeamTier') IS NULL
            BEGIN
                ALTER TABLE Users ADD TeamTier INT NOT NULL CONSTRAINT DF_Users_TeamTier DEFAULT 3;
            END
        `);

        console.log('Successfully added TeamTier column to Users table (1=Leadership, 2=Coordinator, 3=Team Member).');
        process.exit(0);
    } catch (err) {
        console.error('Error adding TeamTier column:', err);
        process.exit(1);
    }
}

addUserTeamTier();
