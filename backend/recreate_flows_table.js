const { poolPromise } = require('./db');

async function recreateTable() {
    try {
        const pool = await poolPromise;
        
        // Drop the old table
        await pool.request().query(`
            IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'DataFlows')
            BEGIN
                DROP TABLE dbo.DataFlows;
            END
        `);
        console.log("Old DataFlows table dropped.");

        // Create the new table
        await pool.request().query(`
            CREATE TABLE dbo.DataFlows (
                Id           INT            IDENTITY(1,1) NOT NULL,
                Title        NVARCHAR(255)  NOT NULL,
                Subtitle     NVARCHAR(500)  NULL,
                SystemName   NVARCHAR(100)  NULL,
                Program      NVARCHAR(100)  NULL,
                Version      NVARCHAR(50)   NULL,
                DocumentDate NVARCHAR(50)   NULL,
                HtmlContent  NVARCHAR(MAX)  NOT NULL,
                BuilderState NVARCHAR(MAX)  NULL,
                IsActive     BIT            NOT NULL CONSTRAINT DF_DataFlows_IsActive DEFAULT 1,
                CreatedAt    DATETIME       NOT NULL CONSTRAINT DF_DataFlows_CreatedAt DEFAULT GETDATE(),

                CONSTRAINT PK_DataFlows PRIMARY KEY CLUSTERED (Id)
            );
        `);
        console.log("New DataFlows table created successfully.");
        
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

recreateTable();
