const { poolPromise } = require('./backend/db');

async function createTable() {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'UploadedFiles'
            )
            BEGIN
                CREATE TABLE dbo.UploadedFiles (
                    Id           INT            IDENTITY(1,1) NOT NULL,
                    FileName     NVARCHAR(255)  NOT NULL,
                    OriginalName NVARCHAR(255)  NOT NULL,
                    MimeType     VARCHAR(100)   NOT NULL,
                    Size         INT            NOT NULL,
                    UploadedBy   VARCHAR(50)    NOT NULL CONSTRAINT DF_UploadedFiles_UploadedBy DEFAULT 'admin',
                    CreatedAt    DATETIME       NOT NULL CONSTRAINT DF_UploadedFiles_CreatedAt DEFAULT GETDATE(),

                    CONSTRAINT PK_UploadedFiles PRIMARY KEY CLUSTERED (Id)
                );
                PRINT 'Table dbo.UploadedFiles created.';
            END
            ELSE
            BEGIN
                PRINT 'Table dbo.UploadedFiles already exists.';
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
