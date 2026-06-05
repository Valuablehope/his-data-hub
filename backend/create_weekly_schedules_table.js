const { poolPromise } = require('./db');

async function createTable() {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'WeeklySchedules'
            )
            BEGIN
                CREATE TABLE dbo.WeeklySchedules (
                    Id           INT            IDENTITY(1,1) NOT NULL,
                    UserId       INT            NOT NULL,
                    DayOfWeek    INT            NOT NULL, -- 0=Sunday, 1=Monday... 6=Saturday
                    IsAvailable  BIT            NOT NULL CONSTRAINT DF_WeeklySchedules_IsAvailable DEFAULT 1,
                    StartTime    TIME           NOT NULL CONSTRAINT DF_WeeklySchedules_StartTime DEFAULT '09:00:00',
                    EndTime      TIME           NOT NULL CONSTRAINT DF_WeeklySchedules_EndTime DEFAULT '17:00:00',

                    CONSTRAINT PK_WeeklySchedules PRIMARY KEY CLUSTERED (Id),
                    CONSTRAINT UQ_WeeklySchedules_UserId_DayOfWeek UNIQUE (UserId, DayOfWeek)
                );
                PRINT 'Table dbo.WeeklySchedules created.';
            END
            ELSE
            BEGIN
                PRINT 'Table dbo.WeeklySchedules already exists.';
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
