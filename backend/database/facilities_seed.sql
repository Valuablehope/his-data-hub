-- ============================================================
-- HIS DATA HUB — Facilities Module
-- Production Database Seed Script
-- Source: Book1.pdf — Lebanon PHCC Grant Coverage Tracker
--
-- Run against your SQL Server database.
-- Safe to re-run: uses IF NOT EXISTS guards everywhere.
-- ============================================================

SET NOCOUNT ON;
BEGIN TRANSACTION;

-- ─── 1. CREATE TABLES ──────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='Grants' AND xtype='U')
CREATE TABLE Grants (
    Id          INT           PRIMARY KEY IDENTITY(1,1),
    GrantCode   NVARCHAR(50)  NOT NULL UNIQUE,
    GrantName   NVARCHAR(255) NOT NULL,
    DonorOrg    NVARCHAR(255) NULL,
    ColorClass  VARCHAR(50)   DEFAULT 'secondary',
    Status      VARCHAR(50)   DEFAULT 'Active',
    Notes       NVARCHAR(MAX) NULL,
    CreatedAt   DATETIME      DEFAULT GETDATE()
);

IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='Facilities' AND xtype='U')
CREATE TABLE Facilities (
    Id           INT           PRIMARY KEY IDENTITY(1,1),
    Name         NVARCHAR(255) NOT NULL,
    FacilityType NVARCHAR(100) NOT NULL,
    Area         NVARCHAR(100) NOT NULL,
    Base         NVARCHAR(100) NOT NULL,
    Address      NVARCHAR(500) NULL,
    Coordinates  NVARCHAR(100) NULL,
    Status       VARCHAR(50)   DEFAULT 'Active',
    Notes        NVARCHAR(MAX) NULL,
    IsActive     BIT           DEFAULT 1,
    UpdatedBy    VARCHAR(100)  DEFAULT 'admin',
    CreatedAt    DATETIME      DEFAULT GETDATE(),
    UpdatedAt    DATETIME      DEFAULT GETDATE()
);

IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='FacilityCoverage' AND xtype='U')
CREATE TABLE FacilityCoverage (
    Id                  INT           PRIMARY KEY IDENTITY(1,1),
    FacilityId          INT           NOT NULL REFERENCES Facilities(Id) ON DELETE CASCADE,
    MainGrantId         INT           NOT NULL REFERENCES Grants(Id),
    CoverageMonth       TINYINT       NOT NULL CHECK (CoverageMonth BETWEEN 1 AND 12),
    CoverageYear        SMALLINT      NOT NULL,
    CoverageStatus      VARCHAR(50)   DEFAULT 'Active',
    CoveragePeriodStart DATE          NULL,
    CoveragePeriodEnd   DATE          NULL,
    ActivitiesCovered   NVARCHAR(MAX) NULL,
    CoverageNotes       NVARCHAR(MAX) NULL,
    UpdatedBy           VARCHAR(100)  DEFAULT 'admin',
    CreatedAt           DATETIME      DEFAULT GETDATE(),
    UpdatedAt           DATETIME      DEFAULT GETDATE(),
    UNIQUE (FacilityId, CoverageMonth, CoverageYear)
);

IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='FacilitySecondaryGrants' AND xtype='U')
CREATE TABLE FacilitySecondaryGrants (
    Id                 INT      PRIMARY KEY IDENTITY(1,1),
    FacilityCoverageId INT      NOT NULL REFERENCES FacilityCoverage(Id) ON DELETE CASCADE,
    GrantId            INT      NOT NULL REFERENCES Grants(Id),
    CreatedAt          DATETIME DEFAULT GETDATE(),
    UNIQUE (FacilityCoverageId, GrantId)
);

-- ─── 2. INSERT GRANTS ──────────────────────────────────────

SET IDENTITY_INSERT Grants ON;

MERGE Grants AS target
USING (VALUES
    ( 1, 'AFD',      'Agence Française de Développement',         'AFD France',         'main'      ),
    ( 2, 'AFD2',     'AFD — Phase 2',                              'AFD France',         'green'     ),
    ( 3, 'NDICI',    'NDICI — Global Europe Instrument',           'European Union',     'secondary' ),
    ( 4, 'NDICI2',   'NDICI — Phase 2',                            'European Union',     'amber'     ),
    ( 5, 'LHF1',     'Lebanon Humanitarian Fund 1',                'OCHA / LHF',         'coral'     ),
    ( 6, 'LHF 79',   'Lebanon Humanitarian Fund 79',               'OCHA / LHF',         'teal'      ),
    ( 7, 'LHF 011',  'Lebanon Humanitarian Fund 011',              'OCHA / LHF',         'coral'     ),
    ( 8, 'LHF 78',   'Lebanon Humanitarian Fund 78',               'OCHA / LHF',         'teal'      ),
    ( 9, 'LHF3',     'Lebanon Humanitarian Fund 3',                'OCHA / LHF',         'coral'     ),
    (10, 'LHF26001', 'Lebanon Humanitarian Fund 26001',            'OCHA / LHF',         'amber'     ),
    (11, 'BHA',      'Bureau for Humanitarian Assistance',         'USAID',              'main'      ),
    (12, 'IOM',      'International Organization for Migration',   'IOM',                'secondary' ),
    (13, 'SIDA',     'Swedish International Development Agency',   'Sweden / Sida',      'green'     ),
    (14, 'QFFD',     'Qatar Fund for Development',                 'Qatar / QFFD',       'amber'     )
) AS src (Id, GrantCode, GrantName, DonorOrg, ColorClass)
ON target.Id = src.Id
WHEN NOT MATCHED THEN
    INSERT (Id, GrantCode, GrantName, DonorOrg, ColorClass)
    VALUES (src.Id, src.GrantCode, src.GrantName, src.DonorOrg, src.ColorClass);

SET IDENTITY_INSERT Grants OFF;

-- ─── 3. INSERT FACILITIES ──────────────────────────────────
-- Base: Saida covers South, BML, Nabatiyeh, Hasbaya, Aley, Chouf, Saida, Bint Jbeil
-- Base: Tripoli covers AKKAR, Tripoli, Minnieh, Baalbek, Hermel

SET IDENTITY_INSERT Facilities ON;

MERGE Facilities AS target
USING (VALUES
    ( 1, 'Qana PHCC',            'PHCC',             'South',     'Saida',   'Qana, South Lebanon',                          '33.2176° N, 35.3028° E', 'Active',    'Primary healthcare center serving Qana sub-district.'),
    ( 2, 'St Paul PHCC',         'PHCC',             'AKKAR',     'Tripoli', 'AKKAR District, North Lebanon',                '34.5528° N, 36.3130° E', 'Active',    'AKKAR district PHCC serving northern communities.'),
    ( 3, 'Makhzoumi PHCC',       'PHCC',             'BML',       'Saida',   'Beirut Mount Lebanon District',                '33.8547° N, 35.5442° E', 'Active',    'BML district PHCC — high beneficiary volume.'),
    ( 4, 'TGH',                  'Teaching Hospital','Tripoli',   'Tripoli', 'Tripoli, North Lebanon',                       '34.4332° N, 35.8499° E', 'Active',    'Teaching General Hospital — referral center for North Lebanon.'),
    ( 5, 'Qabrikha PHCC',        'PHCC',             'South',     'Saida',   'Qabrikha, South Lebanon',                      '33.2740° N, 35.3690° E', 'Active',    'South Lebanon PHCC.'),
    ( 6, 'Nabatiyeh PHCC',       'PHCC',             'Nabatiyeh', 'Saida',   'Nabatiyeh City, South Lebanon',                '33.3777° N, 35.4836° E', 'Active',    'Urban PHCC in Nabatiyeh city center.'),
    ( 7, 'RH Saida',             'Referral Hospital','Saida',     'Saida',   'Saida City, South Lebanon',                    '33.5597° N, 35.3732° E', 'Active',    'Referral hospital for Saida and South Lebanon.'),
    ( 8, 'RH Chebaa',            'Referral Hospital','Hasbaya',   'Saida',   'Chebaa, Hasbaya District',                     '33.5659° N, 35.6450° E', 'Active',    'Referral hospital in the Hasbaya area.'),
    ( 9, 'Maarake PHCC',         'PHCC',             'Nabatiyeh', 'Saida',   'Maarake, Nabatiyeh District',                  '33.2953° N, 35.3968° E', 'Active',    'PHCC covering Maarake and surrounding villages.'),
    (10, 'Jbaa PHCC',            'PHCC',             'Nabatiyeh', 'Saida',   'Jbaa, Nabatiyeh District',                     '33.3558° N, 35.4162° E', 'Active',    'LHF 79 funded PHCC — active through Q3 2025.'),
    (11, 'Serepta PHCC',         'PHCC',             'South',     'Saida',   'Serepta, South Lebanon',                       '33.2520° N, 35.2860° E', 'Active',    'South Lebanon PHCC serving coastal communities.'),
    (12, 'Ghazieh PHCC',         'PHCC',             'South',     'Saida',   'Ghazieh, Saida District',                      '33.5204° N, 35.3701° E', 'Active',    'PHCC north of Saida city.'),
    (13, 'Mar Antonios PHCC',    'PHCC',             'BML',       'Saida',   'Beirut Mount Lebanon District',                '33.8730° N, 35.5140° E', 'Active',    'BML district PHCC.'),
    (14, 'Iklim PHCC',           'PHCC',             'Chouf',     'Saida',   'Iklim El Kharroub, Chouf District',            '33.6019° N, 35.4236° E', 'Active',    'PHCC in Chouf district.'),
    (15, 'Baakleen PHCC',        'PHCC',             'Chouf',     'Saida',   'Baakleen, Chouf District',                     '33.6633° N, 35.5450° E', 'Active',    'Mountain PHCC serving Chouf communities.'),
    (16, 'Choueifat PHCC',       'PHCC',             'BML',       'Saida',   'Choueifat, Greater Beirut',                    '33.7880° N, 35.5040° E', 'Active',    'PHCC serving suburban Beirut population.'),
    (17, 'Hariri PHCC Beirut',   'PHCC',             'BML',       'Saida',   'Beirut, Lebanon',                              '33.8938° N, 35.5018° E', 'Active',    'Urban Beirut PHCC with high catchment area.'),
    (18, 'Baalchmay PHCC',       'PHCC',             'Aley',      'Saida',   'Baalchmay, Aley District',                     '33.7858° N, 35.6265° E', 'Active',    'PHCC transitioning from LHF3 to LHF 011 to NDICI2 in 2025.'),
    (19, 'Farouk PHCC',          'PHCC',             'Minnieh',   'Tripoli', 'Minnieh-Danniyeh, North Lebanon',              '34.4890° N, 36.0610° E', 'Active',    'North Lebanon PHCC transitioning from LHF 011 to AFD2 in Q4 2025.'),
    (20, 'Salemtak PHCC',        'PHCC',             'AKKAR',     'Tripoli', 'AKKAR District, North Lebanon',                '34.5870° N, 36.0090° E', 'Active',    'PHCC transitioning from NDICI to LHF 78 in Q3 2025.'),
    (21, 'Irshad PHCC',          'PHCC',             'AKKAR',     'Tripoli', 'AKKAR District, North Lebanon',                '34.6270° N, 36.1380° E', 'Active',    'AKKAR district PHCC.'),
    (22, 'Fneidek PHCC',         'PHCC',             'AKKAR',     'Tripoli', 'Fneidek, AKKAR District',                      '34.7360° N, 36.0470° E', 'Active',    'Northern AKKAR PHCC near Syrian border.'),
    (23, 'Rahmah PHCC',          'PHCC',             'Tripoli',   'Tripoli', 'Tripoli City, North Lebanon',                  '34.4364° N, 35.8497° E', 'Active',    'Urban PHCC within Tripoli city.'),
    (24, 'REMEDY PHCC',          'PHCC',             'AKKAR',     'Tripoli', 'AKKAR District, North Lebanon',                '34.6430° N, 36.0890° E', 'Active',    'AKKAR PHCC under AFD2 coverage Jan–Oct 2025.'),
    (25, 'Baalbeck PHCC',        'PHCC',             'Baalbek',   'Tripoli', 'Baalbek City, Baalbek-Hermel Governorate',     '34.0042° N, 36.2118° E', 'Active',    'Coverage commenced July 2025 under AFD2.'),
    (26, 'Qaa PHCC',             'PHCC',             'Baalbek',   'Tripoli', 'Qaa, Baalbek-Hermel Governorate',              '34.2810° N, 36.5270° E', 'Active',    'Border-area PHCC — LHF26001 to NDICI2 transition in Jun 2025.'),
    (27, 'Ghoubeiry PHCC',       'PHCC',             'BML',       'Saida',   'Ghoubeiry, Southern Suburbs Beirut',           '33.8505° N, 35.5215° E', 'Active',    'High-density suburban Beirut PHCC — transitioning to SIDA in Q4.'),
    (28, 'Imam Rida PHCC',       'PHCC',             'BML',       'Saida',   'BML District, Lebanon',                        '33.8650° N, 35.5190° E', 'Active',    'BML PHCC transitioning to SIDA in Q4 2025.'),
    (29, 'Nozha PHCC',           'PHCC',             'Tripoli',   'Tripoli', 'Tripoli City, North Lebanon',                  '34.4378° N, 35.8340° E', 'Inactive',  'No active coverage in current period. Pending activation.'),
    (30, 'Khiam PHCC',           'PHCC',             'Nabatiyeh', 'Saida',   'Khiam, Nabatiyeh District',                    '33.3525° N, 35.5934° E', 'Active',    'PHCC near the southern border — NDICI coverage Jan–Oct 2025.'),
    (31, 'Barouk PHCC',          'PHCC',             'Chouf',     'Saida',   'Barouk, Chouf District',                       '33.6727° N, 35.6532° E', 'Active',    'Mountain PHCC — NDICI coverage Jan–Sep 2025.'),
    (32, 'Miriata PHCC',         'PHCC',             'Tripoli',   'Tripoli', 'Tripoli District, North Lebanon',              '34.4730° N, 35.9240° E', 'Active',    'PHCC — NDICI coverage Jan–Aug 2025.'),
    (33, 'Qaser PHCC',           'PHCC',             'Hermel',    'Tripoli', 'Qaser, Hermel District',                       '34.3830° N, 36.4600° E', 'Active',    'Remote PHCC in Hermel — NDICI coverage Jan–Jun 2025.'),
    (34, 'Hazmieh PHCC',         'PHCC',             'BML',       'Saida',   'Hazmieh, Greater Beirut',                      '33.8503° N, 35.5578° E', 'Active',    'Transitioning from AFD to IOM — coverage Jan–Jun 2025.'),
    (35, 'Khatam Anbiaa PHCC',   'PHCC',             'BML',       'Saida',   'BML District, Lebanon',                        '33.8650° N, 35.5000° E', 'Active',    'BML PHCC — NDICI coverage Jan–Oct 2025.'),
    (36, 'Ras Maska PHCC',       'PHCC',             'Tripoli',   'Tripoli', 'Tripoli District, North Lebanon',              '34.4550° N, 35.8700° E', 'Active',    'Tripoli area PHCC — NDICI coverage Jan–Oct 2025.'),
    (37, 'Sidikin PHCC',         'PHCC',             'South',     'Saida',   'Sidikin, South Lebanon',                       '33.4620° N, 35.3260° E', 'Active',    'South Lebanon PHCC — NDICI coverage Jan–Oct 2025.'),
    (38, 'Ketermaya PHCC',       'PHCC',             'Chouf',     'Saida',   'Ketermaya, Chouf District',                    '33.6140° N, 35.4880° E', 'Active',    'Chouf district PHCC — NDICI coverage Jan–Oct 2025.'),
    (39, 'Zahraa PHCC',          'PHCC',             'Nabatiyeh', 'Saida',   'Zahraa, Nabatiyeh District',                   '33.4200° N, 35.4700° E', 'Inactive',  'Coverage ended April 2025. Pending new grant assignment.'),
    (40, 'Borj Qalaway PHCC',    'PHCC',             'Bint Jbeil','Saida',   'Borj Qalaway, Bint Jbeil District',            '33.1215° N, 35.4063° E', 'Inactive',  'South Lebanon border PHCC — coverage ended April 2025.')
) AS src (Id, Name, FacilityType, Area, Base, Address, Coordinates, Status, Notes)
ON target.Id = src.Id
WHEN NOT MATCHED THEN
    INSERT (Id, Name, FacilityType, Area, Base, Address, Coordinates, Status, Notes)
    VALUES (src.Id, src.Name, src.FacilityType, src.Area, src.Base, src.Address, src.Coordinates, src.Status, src.Notes);

SET IDENTITY_INSERT Facilities OFF;

-- ─── 4. BUILD COVERAGE RECORDS ─────────────────────────────
-- Uses a compact month-range approach:
-- (FacilityId, Year, MonthFrom, MonthTo, GrantCode)
-- Each range row expands to one FacilityCoverage row per month.

-- Temp table to hold all coverage ranges from Book1.pdf
IF OBJECT_ID('tempdb..#ranges') IS NOT NULL DROP TABLE #ranges;
CREATE TABLE #ranges (
    FacId    INT,
    YR       SMALLINT,
    MFrom    TINYINT,
    MTo      TINYINT,
    GCode    NVARCHAR(50)
);

-- ── 2025 Coverage ──────────────────────────────────────────
INSERT INTO #ranges VALUES
-- Facility 1 — Qana
(1,2025, 1, 4,'AFD'),   (1,2025, 5,10,'NDICI'),  (1,2025,11,12,'AFD2'),
-- Facility 2 — St Paul
(2,2025, 1, 3,'AFD'),   (2,2025, 4,10,'NDICI'),  (2,2025,11,12,'AFD2'),
-- Facility 3 — Makhzoumi
(3,2025, 1, 5,'AFD'),   (3,2025, 6, 8,'AFD2'),   (3,2025, 9,10,'NDICI'), (3,2025,11,12,'NDICI2'),
-- Facility 4 — TGH
(4,2025, 1, 6,'AFD'),   (4,2025, 7,12,'AFD2'),
-- Facility 5 — Qabrikha
(5,2025, 1, 6,'LHF1'),  (5,2025, 7,10,'NDICI'),  (5,2025,11,12,'LHF 79'),
-- Facility 6 — Nabatiyeh
(6,2025, 1, 6,'LHF1'),  (6,2025, 7,10,'NDICI'),  (6,2025,11,12,'NDICI2'),
-- Facility 7 — RH Saida
(7,2025, 1, 4,'BHA'),   (7,2025, 5,10,'NDICI'),  (7,2025,11,12,'NDICI2'),
-- Facility 8 — RH Chebaa
(8,2025, 1, 4,'BHA'),   (8,2025, 5,10,'NDICI'),  (8,2025,11,12,'AFD2'),
-- Facility 9 — Maarake
(9,2025, 1, 4,'BHA'),   (9,2025, 5, 9,'NDICI'),  (9,2025,10,12,'LHF 79'),
-- Facility 10 — Jbaa
(10,2025,1, 9,'LHF 79'),
-- Facility 11 — Serepta
(11,2025,1,10,'NDICI'),  (11,2025,11,12,'NDICI2'),
-- Facility 12 — Ghazieh
(12,2025,1,10,'NDICI'),  (12,2025,11,12,'NDICI2'),
-- Facility 13 — Mar Antonios
(13,2025,1, 5,'AFD'),   (13,2025, 6, 8,'AFD2'),  (13,2025, 9,10,'NDICI'), (13,2025,11,12,'NDICI2'),
-- Facility 14 — Iklim
(14,2025,1, 9,'NDICI'),  (14,2025,10,12,'AFD2'),
-- Facility 15 — Baakleen
(15,2025,1,10,'NDICI'),  (15,2025,11,12,'NDICI2'),
-- Facility 16 — Choueifat
(16,2025,1,10,'NDICI'),  (16,2025,11,12,'NDICI2'),
-- Facility 17 — Hariri Beirut
(17,2025,1,10,'NDICI'),  (17,2025,11,12,'NDICI2'),
-- Facility 18 — Baalchmay
(18,2025,1, 1,'LHF3'),  (18,2025, 2,10,'LHF 011'), (18,2025,11,12,'NDICI2'),
-- Facility 19 — Farouk PHCC
(19,2025,1,10,'LHF 011'), (19,2025,11,12,'AFD2'),
-- Facility 20 — Salemtak
(20,2025,1, 8,'NDICI'),  (20,2025, 9,12,'LHF 78'),
-- Facility 21 — Irshad
(21,2025,1,10,'NDICI'),  (21,2025,11,12,'NDICI2'),
-- Facility 22 — Fneidek
(22,2025,1,10,'NDICI'),  (22,2025,11,12,'NDICI2'),
-- Facility 23 — Rahmah
(23,2025,1,10,'NDICI'),  (23,2025,11,12,'NDICI2'),
-- Facility 24 — REMEDY
(24,2025,1,10,'AFD2'),
-- Facility 25 — Baalbeck PHCC (starts July 2025)
(25,2025,7,12,'AFD2'),
-- Facility 26 — Qaa PHCC
(26,2025,1, 5,'LHF26001'), (26,2025,6,12,'NDICI2'),
-- Facility 27 — Ghoubeiry
(27,2025,1,10,'NDICI'),  (27,2025,11,12,'SIDA'),
-- Facility 28 — Imam Rida
(28,2025,1,10,'NDICI'),  (28,2025,11,12,'SIDA'),
-- Facility 29 — Nozha: no coverage
-- Facility 30 — Khiam
(30,2025,1,10,'NDICI'),
-- Facility 31 — Barouk
(31,2025,1, 9,'NDICI'),
-- Facility 32 — Miriata
(32,2025,1, 8,'NDICI'),
-- Facility 33 — Qaser
(33,2025,1, 6,'NDICI'),
-- Facility 34 — Hazmieh
(34,2025,1, 3,'AFD'),   (34,2025, 4, 6,'IOM'),
-- Facilities 35-38 (same NDICI pattern Jan-Oct)
(35,2025,1,10,'NDICI'), (36,2025,1,10,'NDICI'), (37,2025,1,10,'NDICI'), (38,2025,1,10,'NDICI'),
-- Facility 39 — Zahraa
(39,2025,1, 4,'NDICI'),
-- Facility 40 — Borj Qalaway
(40,2025,1, 4,'NDICI');

-- ── 2026 Coverage ──────────────────────────────────────────
INSERT INTO #ranges VALUES
-- Facility 1 — Qana
(1,2026, 1,12,'AFD2'),
-- Facility 2 — St Paul
(2,2026, 1,12,'AFD2'),
-- Facility 3 — Makhzoumi
(3,2026, 1,12,'NDICI2'),
-- Facility 4 — TGH
(4,2026, 1,12,'AFD2'),
-- Facility 5 — Qabrikha
(5,2026, 1, 8,'LHF 79'), (5,2026,9,12,'NDICI2'),
-- Facility 6 — Nabatiyeh
(6,2026, 1,12,'NDICI2'),
-- Facility 7 — RH Saida
(7,2026, 1,12,'NDICI2'),
-- Facility 8 — RH Chebaa
(8,2026, 1,12,'NDICI2'),
-- Facility 9 — Maarake
(9,2026, 1, 8,'LHF 79'), (9,2026,9,12,'NDICI2'),
-- Facility 11 — Serepta
(11,2026,1,12,'NDICI2'),
-- Facility 12 — Ghazieh
(12,2026,1,12,'NDICI2'),
-- Facility 13 — Mar Antonios
(13,2026,1,12,'NDICI2'),
-- Facility 15 — Baakleen
(15,2026,1,12,'NDICI2'),
-- Facility 16 — Choueifat
(16,2026,1,12,'NDICI2'),
-- Facility 17 — Hariri Beirut
(17,2026,1,12,'NDICI2'),
-- Facility 18 — Baalchmay
(18,2026,1,12,'NDICI2'),
-- Facility 19 — Farouk PHCC
(19,2026,1, 1,'AFD2'),  (19,2026,2,12,'NDICI2'),
-- Facility 20 — Salemtak
(20,2026,1, 6,'LHF 78'), (20,2026,7,12,'NDICI2'),
-- Facility 21 — Irshad
(21,2026,1,12,'NDICI2'),
-- Facility 22 — Fneidek
(22,2026,1,12,'NDICI2'),
-- Facility 23 — Rahmah
(23,2026,1,12,'NDICI2'),
-- Facility 26 — Qaa PHCC
(26,2026,1,12,'NDICI2');

-- ── Expand ranges → one row per month and insert ───────────
;WITH Months AS (
    SELECT TOP 12 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS m
    FROM sys.objects
)
INSERT INTO FacilityCoverage
    (FacilityId, MainGrantId, CoverageMonth, CoverageYear,
     CoverageStatus, CoveragePeriodStart, CoveragePeriodEnd,
     ActivitiesCovered, UpdatedBy)
SELECT
    r.FacId,
    g.Id,
    CAST(m.m AS TINYINT),
    r.YR,
    'Active',
    DATEFROMPARTS(r.YR, m.m, 1),
    EOMONTH(DATEFROMPARTS(r.YR, m.m, 1)),
    'Primary healthcare services',
    'Operations Team'
FROM #ranges r
JOIN Months m ON m.m BETWEEN r.MFrom AND r.MTo
JOIN Grants g ON g.GrantCode = r.GCode
WHERE NOT EXISTS (
    SELECT 1 FROM FacilityCoverage fc
    WHERE fc.FacilityId    = r.FacId
      AND fc.CoverageYear  = r.YR
      AND fc.CoverageMonth = m.m
);

DROP TABLE #ranges;

COMMIT TRANSACTION;

-- ─── Verification ──────────────────────────────────────────
SELECT 'Grants'           AS [Table], COUNT(*) AS [Rows] FROM Grants
UNION ALL
SELECT 'Facilities',        COUNT(*)              FROM Facilities
UNION ALL
SELECT 'FacilityCoverage',  COUNT(*)              FROM FacilityCoverage
UNION ALL
SELECT '  2025 records',    COUNT(*)              FROM FacilityCoverage WHERE CoverageYear = 2025
UNION ALL
SELECT '  2026 records',    COUNT(*)              FROM FacilityCoverage WHERE CoverageYear = 2026;
