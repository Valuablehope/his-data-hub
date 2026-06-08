const { poolPromise } = require('./db');

async function createTable() {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'ProjectLinks'
            )
            BEGIN
                CREATE TABLE dbo.ProjectLinks (
                    Id           INT             IDENTITY(1,1) NOT NULL,
                    ProjectCode  NVARCHAR(100)   NOT NULL,
                    ProjectName  NVARCHAR(200)   NOT NULL,
                    ToolType     NVARCHAR(50)    NOT NULL,
                    LinkLabel    NVARCHAR(500)   NOT NULL,
                    LinkUrl      NVARCHAR(MAX)   NOT NULL,
                    SortOrder    INT             NOT NULL CONSTRAINT DF_ProjectLinks_SortOrder DEFAULT 0,
                    IsActive     BIT             NOT NULL CONSTRAINT DF_ProjectLinks_IsActive DEFAULT 1,
                    CreatedAt    DATETIME        NOT NULL CONSTRAINT DF_ProjectLinks_CreatedAt DEFAULT GETDATE(),
                    UpdatedAt    DATETIME        NOT NULL CONSTRAINT DF_ProjectLinks_UpdatedAt DEFAULT GETDATE(),

                    CONSTRAINT PK_ProjectLinks PRIMARY KEY CLUSTERED (Id)
                );
                PRINT 'Table dbo.ProjectLinks created.';
            END
            ELSE
            BEGIN
                PRINT 'Table dbo.ProjectLinks already exists.';
            END
        `);
        console.log('Database script executed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Database script failed:', err);
        process.exit(1);
    }
}

createTable();
