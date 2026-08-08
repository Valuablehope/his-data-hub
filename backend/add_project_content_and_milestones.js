const { poolPromise } = require('./db');

// Extends the Projects table (added a few turns back) with a longer-form
// "Content" body for the public project detail page, and adds a
// ProjectMilestones child table so each project can show a visual timeline.
async function migrate() {
    try {
        const pool = await poolPromise;

        const contentCol = await pool.request().query(`
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Projects' AND COLUMN_NAME = 'Content'
        `);
        if (contentCol.recordset.length === 0) {
            await pool.request().query(`
                ALTER TABLE dbo.Projects ADD Content NVARCHAR(MAX) NULL;
            `);
            console.log('Added Projects.Content column.');
        } else {
            console.log('Projects.Content column already exists.');
        }

        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'ProjectMilestones'
            )
            BEGIN
                CREATE TABLE dbo.ProjectMilestones (
                    Id            INT            IDENTITY(1,1) NOT NULL,
                    ProjectId     INT            NOT NULL,
                    Title         NVARCHAR(200)  NOT NULL,
                    Description   NVARCHAR(500)  NULL,
                    DateLabel     NVARCHAR(50)   NULL,   -- free-text: "March 2026", "Phase 2", "Ongoing"
                    SortOrder     INT            NOT NULL CONSTRAINT DF_ProjectMilestones_SortOrder DEFAULT 0,
                    CreatedAt     DATETIME       NOT NULL CONSTRAINT DF_ProjectMilestones_CreatedAt DEFAULT GETDATE(),

                    CONSTRAINT PK_ProjectMilestones PRIMARY KEY CLUSTERED (Id),
                    CONSTRAINT FK_ProjectMilestones_Projects FOREIGN KEY (ProjectId)
                        REFERENCES dbo.Projects(Id) ON DELETE CASCADE
                );
            END
        `);

        console.log('ProjectMilestones table is ready.');
        process.exit(0);
    } catch (err) {
        console.error('Error migrating project content/milestones:', err);
        process.exit(1);
    }
}

migrate();
