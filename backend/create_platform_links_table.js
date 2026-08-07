const { poolPromise } = require('./db');

async function createPlatformLinksTable() {
    try {
        const pool = await poolPromise;

        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'PlatformLinks'
            )
            BEGIN
                CREATE TABLE dbo.PlatformLinks (
                    Id            INT            IDENTITY(1,1) NOT NULL,
                    Name          NVARCHAR(100)  NOT NULL,
                    Url           NVARCHAR(500)  NOT NULL,
                    LogoFileName  NVARCHAR(255)  NULL,
                    SortOrder     INT            NOT NULL CONSTRAINT DF_PlatformLinks_SortOrder DEFAULT 0,
                    IsActive      BIT            NOT NULL CONSTRAINT DF_PlatformLinks_IsActive DEFAULT 1,
                    CreatedAt     DATETIME       NOT NULL CONSTRAINT DF_PlatformLinks_CreatedAt DEFAULT GETDATE(),
                    UpdatedAt     DATETIME       NOT NULL CONSTRAINT DF_PlatformLinks_UpdatedAt DEFAULT GETDATE(),

                    CONSTRAINT PK_PlatformLinks PRIMARY KEY CLUSTERED (Id)
                );
            END
        `);

        // Seed the two links that already existed as hardcoded footer text, so the
        // footer isn't empty on first load. Only runs once (guarded on table being empty).
        const existing = await pool.request().query('SELECT COUNT(*) AS cnt FROM PlatformLinks');
        if (existing.recordset[0].cnt === 0) {
            await pool.request().query(`
                INSERT INTO PlatformLinks (Name, Url, SortOrder) VALUES
                ('TIXO Tickets', 'https://tixo.his-pui.org/', 0),
                ('HIS Login', '/login', 1)
            `);
            console.log('Seeded default PlatformLinks entries (TIXO Tickets, HIS Login).');
        }

        console.log('PlatformLinks table is ready.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating PlatformLinks table:', err);
        process.exit(1);
    }
}

createPlatformLinksTable();
