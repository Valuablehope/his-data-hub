const { poolPromise } = require('./db');

async function addUserPhotoFields() {
    try {
        const pool = await poolPromise;

        await pool.request().query(`
            IF COL_LENGTH('Users', 'PhotoFileName') IS NULL
            BEGIN
                ALTER TABLE Users ADD PhotoFileName NVARCHAR(255) NULL;
            END
        `);

        await pool.request().query(`
            IF COL_LENGTH('Users', 'PublicTitle') IS NULL
            BEGIN
                ALTER TABLE Users ADD PublicTitle NVARCHAR(100) NULL;
            END
        `);

        await pool.request().query(`
            IF COL_LENGTH('Users', 'ShowOnPublicTeam') IS NULL
            BEGIN
                ALTER TABLE Users ADD ShowOnPublicTeam BIT NOT NULL CONSTRAINT DF_Users_ShowOnPublicTeam DEFAULT 0;
            END
        `);

        console.log('Successfully added PhotoFileName, PublicTitle, and ShowOnPublicTeam columns to Users table.');
        process.exit(0);
    } catch (err) {
        console.error('Error adding columns:', err);
        process.exit(1);
    }
}

addUserPhotoFields();
