const { poolPromise } = require('./db');

async function setup() {
    try {
        const pool = await poolPromise;

        // ── Availabilities ────────────────────────────────────────────────
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Availabilities'
            )
            BEGIN
                CREATE TABLE dbo.Availabilities (
                    Id        INT           IDENTITY(1,1) NOT NULL,
                    UserId    INT           NOT NULL,
                    Status    VARCHAR(50)   NOT NULL CONSTRAINT DF_Availabilities_Status    DEFAULT 'Offline',
                    Notes     NVARCHAR(500) NOT NULL CONSTRAINT DF_Availabilities_Notes     DEFAULT '',
                    UpdatedAt DATETIME      NOT NULL CONSTRAINT DF_Availabilities_UpdatedAt DEFAULT GETDATE(),

                    CONSTRAINT PK_Availabilities        PRIMARY KEY CLUSTERED (Id),
                    CONSTRAINT UQ_Availabilities_UserId UNIQUE (UserId),
                    CONSTRAINT FK_Availabilities_Users  FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
                );
                PRINT 'Table dbo.Availabilities created.';
            END
            ELSE
                PRINT 'Table dbo.Availabilities already exists.';
        `);

        // ── WeeklySchedules ───────────────────────────────────────────────
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'WeeklySchedules'
            )
            BEGIN
                CREATE TABLE dbo.WeeklySchedules (
                    Id          INT  IDENTITY(1,1) NOT NULL,
                    UserId      INT  NOT NULL,
                    DayOfWeek   INT  NOT NULL,
                    IsAvailable BIT  NOT NULL CONSTRAINT DF_WeeklySchedules_IsAvailable DEFAULT 1,
                    StartTime   TIME NOT NULL CONSTRAINT DF_WeeklySchedules_StartTime   DEFAULT '09:00:00',
                    EndTime     TIME NOT NULL CONSTRAINT DF_WeeklySchedules_EndTime     DEFAULT '17:00:00',

                    CONSTRAINT PK_WeeklySchedules              PRIMARY KEY CLUSTERED (Id),
                    CONSTRAINT UQ_WeeklySchedules_UserDay      UNIQUE (UserId, DayOfWeek),
                    CONSTRAINT FK_WeeklySchedules_Users        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
                );
                PRINT 'Table dbo.WeeklySchedules created.';
            END
            ELSE
                PRINT 'Table dbo.WeeklySchedules already exists.';
        `);

        // ── Seed Availabilities for existing HIS_TEAM users ───────────────
        const result = await pool.request().query(`
            INSERT INTO Availabilities (UserId)
            SELECT u.Id
            FROM Users u
            WHERE u.Role = 'HIS_TEAM'
              AND NOT EXISTS (
                SELECT 1 FROM Availabilities a WHERE a.UserId = u.Id
              )
        `);
        console.log(`Seeded ${result.rowsAffected[0]} availability row(s) for existing HIS_TEAM users.`);

        console.log('\nSetup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Setup failed:', err);
        process.exit(1);
    }
}

setup();
