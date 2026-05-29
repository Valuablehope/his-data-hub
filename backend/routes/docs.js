const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

// Get all documents (metadata only)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT Id, Title, Category, UpdatedAt FROM Documents ORDER BY UpdatedAt DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("DB Error, returning mock data:", err);
        res.json([
            { Id: 1, Title: 'Patient Registration SOP', Category: 'SOP', UpdatedAt: '2026-05-25T10:00:00Z' },
            { Id: 2, Title: 'PHENICS Module 3 Guide', Category: 'Manual', UpdatedAt: '2026-05-22T14:30:00Z' },
            { Id: 3, Title: 'Data Privacy Guidelines', Category: 'Strategy', UpdatedAt: '2026-05-18T09:15:00Z' }
        ]);
    }
});

// Get document content
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', require('mssql').Int, req.params.id)
            .query('SELECT Content FROM Documents WHERE Id = @id');
            
        if (result.recordset.length > 0) {
            res.json({ content: result.recordset[0].Content });
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        console.error("DB Error, returning mock data:", err);
        const mockContent = `# Document ${req.params.id}
        
This is a beautifully rendered Markdown document. Since the database connection to SQL Server failed or isn't set up yet, we are serving this mock content.

## Setup Instructions

Once your database is ready, you will need to create the table using this script:

\`\`\`sql
CREATE TABLE Documents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Content TEXT NOT NULL,
    UpdatedAt DATETIME DEFAULT GETDATE()
);

INSERT INTO Documents (Title, Category, Content) VALUES ('Test SOP', 'SOP', '# Welcome to HIS Hub...');
\`\`\`

### Features of this Viewer
* **Live Markdown Parsing**: Edits to the database instantly reflect here.
* **Syntax Highlighting**: Code blocks are automatically formatted.
* **Responsive**: Reads well on any device.
`;
        res.json({ content: mockContent });
    }
});

module.exports = router;
