const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../db');

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        if (user.role !== 'admin') return res.status(403).json({ error: 'Requires admin privileges' });
        req.user = user;
        next();
    });
};

// Get all documents (metadata only)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT TOP 500 Id, Title, Category, UpdatedAt FROM Documents ORDER BY UpdatedAt DESC');
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

// Create a new document
router.post('/', authenticateAdmin, async (req, res) => {
    const { title, category, content } = req.body;
    if (!title || !category || !content) {
        return res.status(400).json({ error: 'Title, Category, and Content are required' });
    }
    
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Title', sql.VarChar, title)
            .input('Category', sql.VarChar, category)
            .input('Content', sql.Text, content)
            .query(`
                INSERT INTO Documents (Title, Category, Content, IsPublished, CreatedBy)
                OUTPUT INSERTED.Id
                VALUES (@Title, @Category, @Content, 1, 'admin')
            `);
        res.status(201).json({ message: 'Document created successfully', id: result.recordset[0].Id });
    } catch (err) {
        console.error('Error creating document:', err);
        res.status(500).json({ error: 'Failed to create document' });
    }
});

// Update an existing document
router.put('/:id', authenticateAdmin, async (req, res) => {
    const { title, category, content } = req.body;
    if (!title || !category || !content) {
        return res.status(400).json({ error: 'Title, Category, and Content are required' });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, req.params.id)
            .input('Title', sql.VarChar, title)
            .input('Category', sql.VarChar, category)
            .input('Content', sql.Text, content)
            .query(`
                UPDATE Documents 
                SET Title = @Title, Category = @Category, Content = @Content, UpdatedAt = GETDATE()
                WHERE Id = @Id
            `);
        res.json({ message: 'Document updated successfully' });
    } catch (err) {
        console.error('Error updating document:', err);
        res.status(500).json({ error: 'Failed to update document' });
    }
});

// Delete a document
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('DELETE FROM Documents WHERE Id = @Id');
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error('Error deleting document:', err);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

module.exports = router;
