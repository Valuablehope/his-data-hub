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
        Id               INT           IDENTITY(1,1) NOT NULL,
        Username         VARCHAR(50)   NOT NULL,
        PasswordHash     VARCHAR(255)  NOT NULL,          -- bcrypt hash
        Role             VARCHAR(50)   NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'viewer',
        DisplayName      VARCHAR(100)  NULL,
        IsActive         BIT           NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
        ShowOnDashboard  BIT           NOT NULL CONSTRAINT DF_Users_ShowOnDashboard DEFAULT 1,
        -- Public-facing "Meet the Team" fields on the landing page (opt-in, admin-controlled).
        -- PublicTitle is a free-text role label distinct from Role (the internal auth
        -- permission level), so the public page never exposes who holds admin credentials.
        PhotoFileName    NVARCHAR(255) NULL,
        PublicTitle      NVARCHAR(100) NULL,
        ShowOnPublicTeam BIT           NOT NULL CONSTRAINT DF_Users_ShowOnPublicTeam DEFAULT 0,
        -- Seniority tier for the public "Meet the Team" hierarchy display:
        -- 1 = Leadership, 2 = Coordinator, 3 = Team Member (default).
        TeamTier         INT           NOT NULL CONSTRAINT DF_Users_TeamTier DEFAULT 3,
        LastLogin        DATETIME      NULL,
        CreatedAt        DATETIME      NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE(),

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
        Id           INT            IDENTITY(1,1) NOT NULL,
        Title        NVARCHAR(255)  NOT NULL,
        Subtitle     NVARCHAR(500)  NULL,
        SystemName   NVARCHAR(100)  NULL,
        Program      NVARCHAR(100)  NULL,
        Version      NVARCHAR(50)   NULL,
        DocumentDate NVARCHAR(50)   NULL,
        HtmlContent  NVARCHAR(MAX)  NOT NULL,
        IsActive     BIT            NOT NULL CONSTRAINT DF_DataFlows_IsActive DEFAULT 1,
        CreatedAt    DATETIME       NOT NULL CONSTRAINT DF_DataFlows_CreatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_DataFlows PRIMARY KEY CLUSTERED (Id)
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

-- ============================================================
-- 5. UploadedFiles
--    Tracks uploaded documents (PDFs, DOCX) in the Document Vault.
-- ============================================================
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
GO

-- ============================================================
-- 6. PlatformLinks
--    Admin-managed list of external/internal system links shown
--    as logo badges in the public landing page footer.
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'PlatformLinks'
)
BEGIN
    CREATE TABLE dbo.PlatformLinks (
        Id            INT            IDENTITY(1,1) NOT NULL,
        Name          NVARCHAR(100)  NOT NULL,
        Url           NVARCHAR(500)  NOT NULL,          -- internal path (e.g. /login) or external URL
        LogoFileName  NVARCHAR(255)  NULL,
        SortOrder     INT            NOT NULL CONSTRAINT DF_PlatformLinks_SortOrder DEFAULT 0,
        IsActive      BIT            NOT NULL CONSTRAINT DF_PlatformLinks_IsActive DEFAULT 1,
        CreatedAt     DATETIME       NOT NULL CONSTRAINT DF_PlatformLinks_CreatedAt DEFAULT GETDATE(),
        UpdatedAt     DATETIME       NOT NULL CONSTRAINT DF_PlatformLinks_UpdatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_PlatformLinks PRIMARY KEY CLUSTERED (Id)
    );
    PRINT 'Table dbo.PlatformLinks created.';
END
GO

-- ============================================================
-- 7. Projects
--    Admin-managed showcase of projects/contributions to the national
--    health system, shown in their own section on the public landing page.
--    Distinct from dbo.ProjectLinks (per-project tool URLs, no logo).
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Projects'
)
BEGIN
    CREATE TABLE dbo.Projects (
        Id            INT            IDENTITY(1,1) NOT NULL,
        Name          NVARCHAR(150)  NOT NULL,
        Description   NVARCHAR(500)  NULL,           -- short blurb, shown on the landing page card
        Content       NVARCHAR(MAX)  NULL,            -- longer markdown body, shown on the project detail page
        Partner       NVARCHAR(150)  NULL,
        Url           NVARCHAR(500)  NULL,
        LogoFileName  NVARCHAR(255)  NULL,
        SortOrder     INT            NOT NULL CONSTRAINT DF_Projects_SortOrder DEFAULT 0,
        IsActive      BIT            NOT NULL CONSTRAINT DF_Projects_IsActive DEFAULT 1,
        CreatedAt     DATETIME       NOT NULL CONSTRAINT DF_Projects_CreatedAt DEFAULT GETDATE(),
        UpdatedAt     DATETIME       NOT NULL CONSTRAINT DF_Projects_UpdatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_Projects PRIMARY KEY CLUSTERED (Id)
    );
    PRINT 'Table dbo.Projects created.';
END
GO

-- ============================================================
-- 8. ProjectMilestones
--    Ordered timeline entries for a Project's detail page.
-- ============================================================
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
        DateLabel     NVARCHAR(50)   NULL,             -- free-text: "March 2026", "Phase 2", "Ongoing"
        SortOrder     INT            NOT NULL CONSTRAINT DF_ProjectMilestones_SortOrder DEFAULT 0,
        CreatedAt     DATETIME       NOT NULL CONSTRAINT DF_ProjectMilestones_CreatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_ProjectMilestones PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT FK_ProjectMilestones_Projects FOREIGN KEY (ProjectId)
            REFERENCES dbo.Projects(Id) ON DELETE CASCADE
    );
    PRINT 'Table dbo.ProjectMilestones created.';
END
GO

PRINT '=== HIS Data Hub schema applied successfully ===';
GO
