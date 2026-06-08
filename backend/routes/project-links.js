const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT Id, ProjectCode, ProjectName, ToolType, LinkLabel, LinkUrl, SortOrder, CreatedAt
            FROM ProjectLinks
            WHERE IsActive = 1
            ORDER BY ProjectCode, SortOrder, ToolType
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to fetch project links' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', req.params.id)
            .query('SELECT * FROM ProjectLinks WHERE Id = @Id AND IsActive = 1');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Link not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to fetch link' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { projectCode, projectName, toolType, linkLabel, linkUrl, sortOrder } = req.body;
        if (!projectCode || !projectName || !toolType || !linkLabel || !linkUrl) {
            return res.status(400).json({ error: 'projectCode, projectName, toolType, linkLabel, and linkUrl are required' });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProjectCode', projectCode)
            .input('ProjectName', projectName)
            .input('ToolType', toolType)
            .input('LinkLabel', linkLabel)
            .input('LinkUrl', linkUrl)
            .input('SortOrder', sortOrder || 0)
            .query(`
                INSERT INTO ProjectLinks (ProjectCode, ProjectName, ToolType, LinkLabel, LinkUrl, SortOrder)
                OUTPUT INSERTED.*
                VALUES (@ProjectCode, @ProjectName, @ToolType, @LinkLabel, @LinkUrl, @SortOrder)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to create link' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { projectCode, projectName, toolType, linkLabel, linkUrl, sortOrder } = req.body;
        if (!projectCode || !projectName || !toolType || !linkLabel || !linkUrl) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const pool = await poolPromise;
        const check = await pool.request()
            .input('Id', req.params.id)
            .query('SELECT Id FROM ProjectLinks WHERE Id = @Id');
        if (check.recordset.length === 0) return res.status(404).json({ error: 'Link not found' });

        const result = await pool.request()
            .input('Id', req.params.id)
            .input('ProjectCode', projectCode)
            .input('ProjectName', projectName)
            .input('ToolType', toolType)
            .input('LinkLabel', linkLabel)
            .input('LinkUrl', linkUrl)
            .input('SortOrder', sortOrder || 0)
            .query(`
                UPDATE ProjectLinks
                SET ProjectCode = @ProjectCode, ProjectName = @ProjectName,
                    ToolType = @ToolType, LinkLabel = @LinkLabel,
                    LinkUrl = @LinkUrl, SortOrder = @SortOrder,
                    UpdatedAt = GETDATE()
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to update link' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const check = await pool.request()
            .input('Id', req.params.id)
            .query('SELECT Id FROM ProjectLinks WHERE Id = @Id');
        if (check.recordset.length === 0) return res.status(404).json({ error: 'Link not found' });
        await pool.request()
            .input('Id', req.params.id)
            .query('UPDATE ProjectLinks SET IsActive = 0, UpdatedAt = GETDATE() WHERE Id = @Id');
        res.json({ success: true });
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

module.exports = router;
