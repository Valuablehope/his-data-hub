const { poolPromise } = require('./db');

async function createTable() {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Availabilities'
            )
            BEGIN
                CREATE TABLE dbo.Availabilities (
                    Id           INT            IDENTITY(1,1) NOT NULL,
                    UserId       INT            NOT NULL,
                    Status       VARCHAR(50)    NOT NULL CONSTRAINT DF_Availabilities_Status DEFAULT 'Online',
                    Notes        NVARCHAR(255)  NULL,
                    UpdatedAt    DATETIME       NOT NULL CONSTRAINT DF_Availabilities_UpdatedAt DEFAULT GETDATE(),

                    CONSTRAINT PK_Availabilities PRIMARY KEY CLUSTERED (Id)
                );
                PRINT 'Table dbo.Availabilities created.';
            END
            ELSE
            BEGIN
                PRINT 'Table dbo.Availabilities already exists.';
            END
        `);
        console.log("Database script executed successfully");
        process.exit(0);
    } catch (err) {
        console.error("Database script failed:", err);
        process.exit(1);
    }
}

createTable();
