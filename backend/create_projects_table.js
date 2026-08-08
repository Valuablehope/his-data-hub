const { poolPromise } = require('./db');

// "Projects" — admin-managed showcase of projects/contributions to the
// national health system, shown in their own section on the public landing
// page. Distinct from the existing "ProjectLinks" table (per-project tool
// URLs, no logo) — do not confuse the two.
async function createProjectsTable() {
    try {
        const pool = await poolPromise;

        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Projects'
            )
            BEGIN
                CREATE TABLE dbo.Projects (
                    Id            INT            IDENTITY(1,1) NOT NULL,
                    Name          NVARCHAR(150)  NOT NULL,
                    Description   NVARCHAR(500)  NULL,
                    Partner       NVARCHAR(150)  NULL,     -- e.g. "Ministry of Public Health"
                    Url           NVARCHAR(500)  NULL,      -- optional "learn more" link
                    LogoFileName  NVARCHAR(255)  NULL,
                    SortOrder     INT            NOT NULL CONSTRAINT DF_Projects_SortOrder DEFAULT 0,
                    IsActive      BIT            NOT NULL CONSTRAINT DF_Projects_IsActive DEFAULT 1,
                    CreatedAt     DATETIME       NOT NULL CONSTRAINT DF_Projects_CreatedAt DEFAULT GETDATE(),
                    UpdatedAt     DATETIME       NOT NULL CONSTRAINT DF_Projects_UpdatedAt DEFAULT GETDATE(),

                    CONSTRAINT PK_Projects PRIMARY KEY CLUSTERED (Id)
                );
            END
        `);

        console.log('Projects table is ready.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating Projects table:', err);
        process.exit(1);
    }
}

createProjectsTable();
