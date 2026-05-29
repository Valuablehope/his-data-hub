-- ============================================================
-- HIS Data Hub — Database Schema
-- Target : Microsoft SQL Server 2016+
-- Run    : Execute against an empty HISDataHub database.
--          Safe to re-run — all CREATE statements are guarded.
-- ============================================================

USE HISDataHub;
GO

-- ============================================================
-- 1. Users
--    Stores portal accounts. Auth currently hardcoded in
--    backend/routes/auth.js; this table is ready for when that
--    moves to DB-backed login.
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users'
)
BEGIN
    CREATE TABLE dbo.Users (
        Id           INT          IDENTITY(1,1) NOT NULL,
        Username     VARCHAR(50)  NOT NULL,
        PasswordHash VARCHAR(255) NOT NULL,          -- bcrypt hash
        Role         VARCHAR(50)  NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'viewer',
        IsActive     BIT          NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
        LastLogin    DATETIME     NULL,
        CreatedAt    DATETIME     NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT UQ_Users_Username UNIQUE (Username)
    );
    PRINT 'Table dbo.Users created.';
END
GO

-- ============================================================
-- 2. Documents
--    SOPs, manuals, and policy documents displayed in the
--    Documentation page. Content is stored as Markdown.
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Documents'
)
BEGIN
    CREATE TABLE dbo.Documents (
        Id          INT            IDENTITY(1,1) NOT NULL,
        Title       NVARCHAR(255)  NOT NULL,
        Category    NVARCHAR(50)   NOT NULL,   -- 'SOP' | 'Manual' | 'Strategy' | 'Policy'
        Content     NVARCHAR(MAX)  NOT NULL,   -- Markdown body
        IsPublished BIT            NOT NULL CONSTRAINT DF_Documents_IsPublished DEFAULT 1,
        CreatedBy   VARCHAR(50)    NULL,
        UpdatedAt   DATETIME       NOT NULL CONSTRAINT DF_Documents_UpdatedAt DEFAULT GETDATE(),
        CreatedAt   DATETIME       NOT NULL CONSTRAINT DF_Documents_CreatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_Documents PRIMARY KEY CLUSTERED (Id)
    );

    CREATE NONCLUSTERED INDEX IX_Documents_Category ON dbo.Documents (Category);
    CREATE NONCLUSTERED INDEX IX_Documents_UpdatedAt ON dbo.Documents (UpdatedAt DESC);

    PRINT 'Table dbo.Documents created.';
END
GO

-- ============================================================
-- 3. DataFlows
--    PHENICS data synchronisation pipelines shown on the
--    Flows page. The API route does SELECT * FROM DataFlows,
--    so column names map directly to the JSON response.
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'DataFlows'
)
BEGIN
    CREATE TABLE dbo.DataFlows (
        Id          INT            IDENTITY(1,1) NOT NULL,
        Name        NVARCHAR(255)  NOT NULL,
        Source      NVARCHAR(100)  NOT NULL,
        Destination NVARCHAR(100)  NOT NULL,
        Status      VARCHAR(50)    NOT NULL CONSTRAINT DF_DataFlows_Status DEFAULT 'Healthy',
        -- 'Healthy' | 'Warning' | 'Error'
        LastSync    DATETIME       NULL     CONSTRAINT DF_DataFlows_LastSync DEFAULT GETDATE(),
        Type        VARCHAR(50)    NOT NULL CONSTRAINT DF_DataFlows_Type DEFAULT 'Unidirectional',
        -- 'Unidirectional' | 'Bidirectional'
        IsActive    BIT            NOT NULL CONSTRAINT DF_DataFlows_IsActive DEFAULT 1,
        CreatedAt   DATETIME       NOT NULL CONSTRAINT DF_DataFlows_CreatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_DataFlows PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT CK_DataFlows_Status CHECK (Status IN ('Healthy', 'Warning', 'Error')),
        CONSTRAINT CK_DataFlows_Type   CHECK (Type   IN ('Unidirectional', 'Bidirectional'))
    );

    PRINT 'Table dbo.DataFlows created.';
END
GO

-- ============================================================
-- 4. ActivityForms
--    Local audit log of every form submission forwarded to
--    the TIXO helpdesk. Lets admins replay or audit tickets
--    without hitting the external TIXO API.
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'ActivityForms'
)
BEGIN
    CREATE TABLE dbo.ActivityForms (
        Id                INT            IDENTITY(1,1) NOT NULL,
        Title             NVARCHAR(255)  NOT NULL,
        Description       NVARCHAR(MAX)  NOT NULL,
        CategoryId        INT            NOT NULL,   -- mirrors TIXO category_id
        Priority          VARCHAR(20)    NOT NULL CONSTRAINT DF_ActivityForms_Priority DEFAULT 'Medium',
        -- 'Low' | 'Medium' | 'High' | 'Critical'
        SourceChannel     VARCHAR(100)   NOT NULL CONSTRAINT DF_ActivityForms_SourceChannel DEFAULT 'HIS Data Hub Portal',
        TixoTicketId      INT            NULL,       -- ID returned by TIXO on success
        TixoReferenceCode VARCHAR(50)    NULL,       -- e.g. TKT-00294
        SubmittedBy       VARCHAR(50)    NOT NULL CONSTRAINT DF_ActivityForms_SubmittedBy DEFAULT 'admin',
        Status            VARCHAR(50)    NOT NULL CONSTRAINT DF_ActivityForms_Status DEFAULT 'Pending',
        -- 'Pending' | 'Open' | 'Resolved' | 'Closed'
        SubmittedAt       DATETIME       NOT NULL CONSTRAINT DF_ActivityForms_SubmittedAt DEFAULT GETDATE(),

        CONSTRAINT PK_ActivityForms PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT CK_ActivityForms_Priority CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
        CONSTRAINT CK_ActivityForms_Status   CHECK (Status   IN ('Pending', 'Open', 'Resolved', 'Closed'))
    );

    CREATE NONCLUSTERED INDEX IX_ActivityForms_Status      ON dbo.ActivityForms (Status);
    CREATE NONCLUSTERED INDEX IX_ActivityForms_SubmittedAt ON dbo.ActivityForms (SubmittedAt DESC);

    PRINT 'Table dbo.ActivityForms created.';
END
GO

PRINT '=== HIS Data Hub schema applied successfully ===';
GO
