-- ============================================================
-- HIS Data Hub — Seed Data
-- Run AFTER schema.sql.
-- Safe to re-run — all inserts are guarded with NOT EXISTS.
-- ============================================================

USE HISDataHub;
GO

-- ============================================================
-- Users
-- The password hash below is a bcrypt hash (cost 10) of the
-- string "admin".  Change the password immediately after first
-- login, or replace this hash with your own before running.
--
-- To generate a new hash in Node.js:
--   node -e "const b=require('bcrypt');b.hash('YourPass',10).then(console.log)"
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'admin')
BEGIN
    INSERT INTO dbo.Users (Username, PasswordHash, Role)
    VALUES (
        'admin',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin'
    );
    PRINT 'Seed: admin user inserted.';
END
GO

-- ============================================================
-- Documents
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Documents)
BEGIN
    INSERT INTO dbo.Documents (Title, Category, Content, CreatedBy) VALUES

    -- 1. Patient Registration SOP
    (N'Patient Registration SOP', N'SOP', N'# Patient Registration Standard Operating Procedure

## Purpose
To ensure accurate and consistent patient registration across all HIS modules.

## Scope
Applies to all front-desk and administrative staff with access to the Patient Registration module.

## Procedure

### 1. Verify Patient Identity
- Request a valid government-issued photo ID.
- Cross-reference against existing records using the **Patient Search** function.
- If a duplicate is found, merge records using the Duplicate Resolution workflow.

### 2. Capture Demographic Data
Collect the following mandatory fields:
- Full legal name (First, Middle, Last)
- Date of birth
- National ID / Passport number
- Contact number and emergency contact
- Medical aid scheme and membership number (if applicable)

### 3. Assign Encounter Number
The system auto-generates a unique Encounter Number upon saving. Print and attach the wristband before the patient proceeds to triage.

### 4. Sync to PHENICS
Patient records are automatically pushed to the **PHENICS Master** via the *Patient Admissions Sync* flow within 2 minutes of saving.

> **Note:** If the PHENICS sync indicator shows a warning, do not re-register the patient. Log an incident via the Forms page instead.

## References
- PHENICS Module 3 Guide
- Data Privacy Guidelines
', N'admin'),

    -- 2. PHENICS Module 3 Integration Guide
    (N'PHENICS Module 3 Integration Guide', N'Manual', N'# PHENICS Module 3 — HIS Integration Guide

## Overview
Module 3 governs the bidirectional exchange of clinical encounter data between the local HIS database and the PHENICS Master aggregation system.

## Architecture

```
HIS Local DB  ←──────────────────→  PHENICS Master
  (MSSQL)         Patient Admissions      (Remote)
                  Sync (Bidirectional)
```

## Endpoints

| Flow | Source | Destination | Frequency |
|------|--------|-------------|-----------|
| Patient Admissions | HIS Local DB | PHENICS Master | Real-time |
| Lab Results Export | LIS Module | PHENICS Lab Endpoint | Every 5 min |
| Billing Data Rollup | Finance Module | PHENICS Finance | Hourly |
| Pharmacy Inventory | Pharmacy DB | PHENICS Logistics | Every 10 min |

## Troubleshooting

### Flow shows "Warning" status
1. Navigate to the **Flows** page in HIS Data Hub.
2. Click **View Logs** on the affected flow.
3. Identify the last successful sync timestamp.
4. If gap > 1 hour, trigger a manual re-sync via the **Sync** button.
5. If re-sync fails, submit an **Incident Report** form.

### PHENICS API returns 401
The service account token may have expired. Contact the PHENICS system administrator to rotate the service credentials.

## Configuration
All sync intervals and retry logic are managed by the PHENICS scheduler. Contact the integration team to adjust thresholds.
', N'admin'),

    -- 3. Data Privacy and Handling Policy
    (N'Data Privacy and Handling Policy', N'Policy', N'# Data Privacy and Handling Policy

## 1. Purpose
To define the organisation''s obligations regarding the collection, storage, processing, and sharing of patient health data in compliance with applicable legislation.

## 2. Scope
All staff, contractors, and third-party vendors with access to HIS systems or patient data.

## 3. Principles

### 3.1 Data Minimisation
Collect only the data necessary for the stated clinical or administrative purpose.

### 3.2 Purpose Limitation
Data collected for patient care may not be repurposed for marketing, research, or third-party sharing without explicit written consent.

### 3.3 Access Control
- All access is role-based.
- Data Access Requests must be submitted via the **Activity Forms** page.
- Access logs are retained for a minimum of **3 years**.

### 3.4 Data Retention
| Data Type | Retention Period |
|-----------|-----------------|
| Clinical records | 10 years post last encounter |
| Administrative logs | 3 years |
| Audit trails | 5 years |

## 4. Breach Response
In the event of a suspected data breach:
1. Immediately report to the Data Protection Officer (DPO).
2. Submit an **Incident Report** via the Forms page.
3. Do not attempt to contain the breach independently.

## 5. Third-Party Integrations
Vendors (including PHENICS and TIXO) are contractually bound by a Data Processing Agreement (DPA). Review current DPAs with the DPO annually.
', N'admin'),

    -- 4. Data Access Request Guide
    (N'Data Access Request Guide', N'SOP', N'# Data Access Request — Submission Guide

## When to Use This Form
Submit a **Data Access Request** whenever you need access to:
- A PHENICS module you are not currently provisioned for.
- A restricted data warehouse or reporting schema.
- Patient records outside your assigned ward or department.

## How to Submit
1. Navigate to **Forms** in the top navigation bar.
2. Select **Data Access Request**.
3. Fill in the **Ticket Title** with a brief description: e.g., *"Access to PHENICS Finance Module — Billing Audit Q2"*.
4. Set **Priority** to:
   - **Low** — convenience / reporting access
   - **Medium** — operational requirement
   - **High** — clinical urgency
   - **Critical** — active patient safety concern
5. In the **Detailed Description**, include:
   - The specific module or dataset required.
   - The business justification.
   - The proposed access duration.
6. Click **Submit Ticket**. A TIXO reference number will be returned on success.

## Approval Turnaround
| Priority | Target Response |
|----------|----------------|
| Low | 5 business days |
| Medium | 2 business days |
| High | Same business day |
| Critical | Within 2 hours |
', N'admin');

    PRINT 'Seed: Documents inserted.';
END
GO

-- ============================================================
-- DataFlows
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.DataFlows)
BEGIN
    INSERT INTO dbo.DataFlows (Name, Source, Destination, Status, LastSync, Type) VALUES
    (N'Patient Admissions Sync',  N'HIS Local DB',    N'PHENICS Master',         'Healthy', DATEADD(MINUTE, -2,  GETDATE()), 'Bidirectional'),
    (N'Lab Results Export',       N'LIS Module',      N'PHENICS Lab Endpoint',   'Healthy', DATEADD(MINUTE, -5,  GETDATE()), 'Unidirectional'),
    (N'Billing Data Rollup',      N'Finance Module',  N'PHENICS Finance',        'Warning', DATEADD(HOUR,   -4,  GETDATE()), 'Unidirectional'),
    (N'Pharmacy Inventory',       N'Pharmacy DB',     N'PHENICS Logistics',      'Healthy', DATEADD(MINUTE, -10, GETDATE()), 'Unidirectional');

    PRINT 'Seed: DataFlows inserted.';
END
GO

-- ============================================================
-- ActivityForms  (empty — populated by actual form submissions)
-- ============================================================
PRINT 'Seed: ActivityForms table left empty (populated at runtime).';
GO

PRINT '=== HIS Data Hub seed data applied successfully ===';
GO
