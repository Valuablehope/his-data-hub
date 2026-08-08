const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sanitizeHtml = require('sanitize-html');
const { requireContentManager } = require('../middleware/auth');

// Get all flows — one card per version group (latest version wins). Public,
// Flow manuals are viewable without login.
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result;
        try {
            // Show only the most recent version in each FlowGroupId bucket.
            // ISNULL(FlowGroupId, Id) treats ungrouped flows as their own group.
            result = await pool.request().query(`
                SELECT TOP 500 Id, Title, Subtitle, SystemName, Program, Version, DocumentDate, CreatedAt
                FROM (
                    SELECT *,
                        ROW_NUMBER() OVER (
                            PARTITION BY ISNULL(FlowGroupId, Id)
                            ORDER BY CreatedAt DESC
                        ) AS rn
                    FROM DataFlows
                    WHERE IsActive = 1
                ) t
                WHERE rn = 1
                ORDER BY CreatedAt DESC
            `);
        } catch (_) {
            // FlowGroupId column not yet added — fall back to simple query
            result = await pool.request().query(
                'SELECT TOP 500 Id, Title, Subtitle, SystemName, Program, Version, DocumentDate, CreatedAt FROM DataFlows WHERE IsActive = 1 ORDER BY CreatedAt DESC'
            );
        }
        res.json(result.recordset);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: 'Failed to fetch flows' });
    }
});

// Get single flow by ID (includes sibling versions if FlowGroupId is set) — public
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', req.params.id)
            .query('SELECT * FROM DataFlows WHERE Id = @Id AND IsActive = 1');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Flow not found' });
        }

        const flow = result.recordset[0];
        let versions = [];

        // flow.FlowGroupId will be undefined if column doesn't exist yet (pre-migration)
        if (flow.FlowGroupId != null) {
            const vResult = await pool.request()
                .input('GroupId', flow.FlowGroupId)
                .query(`
                    SELECT Id, Title, Version, DocumentDate
                    FROM DataFlows
                    WHERE FlowGroupId = @GroupId AND IsActive = 1
                    ORDER BY CreatedAt ASC
                `);
            versions = vResult.recordset;
        }

        res.json({ ...flow, versions });
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: 'Failed to fetch flow' });
    }
});

// Create new flow
router.post('/', requireContentManager, async (req, res) => {
    try {
        const { title, subtitle, systemName, program, version, documentDate, htmlContent, builderState } = req.body;
        
        if (!title || !htmlContent) {
            return res.status(400).json({ error: 'Title and HTML content are required' });
        }

        const cleanHtml = sanitizeHtml(htmlContent, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3']),
            allowedAttributes: {
                '*': ['style', 'class'],
                'a': ['href', 'name', 'target'],
                'img': ['src', 'alt', 'width', 'height']
            }
        });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Title', title)
            .input('Subtitle', subtitle || '')
            .input('SystemName', systemName || '')
            .input('Program', program || '')
            .input('Version', version || '')
            .input('DocumentDate', documentDate || '')
            .input('HtmlContent', cleanHtml)
            .input('BuilderState', builderState ? JSON.stringify(builderState) : null)
            .query(`
                INSERT INTO DataFlows (Title, Subtitle, SystemName, Program, Version, DocumentDate, HtmlContent, BuilderState)
                OUTPUT INSERTED.*
                VALUES (@Title, @Subtitle, @SystemName, @Program, @Version, @DocumentDate, @HtmlContent, @BuilderState)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: 'Failed to create flow' });
    }
});

// Update existing flow
router.put('/:id', requireContentManager, async (req, res) => {
    try {
        const { title, subtitle, systemName, program, version, documentDate, htmlContent, builderState } = req.body;
        
        if (!title || !htmlContent) {
            return res.status(400).json({ error: 'Title and HTML content are required' });
        }

        const cleanHtml = sanitizeHtml(htmlContent, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3']),
            allowedAttributes: {
                '*': ['style', 'class'],
                'a': ['href', 'name', 'target'],
                'img': ['src', 'alt', 'width', 'height']
            }
        });

        const pool = await poolPromise;
        
        const check = await pool.request().input('Id', req.params.id).query('SELECT Id FROM DataFlows WHERE Id = @Id');
        if (check.recordset.length === 0) {
            return res.status(404).json({ error: 'Flow not found' });
        }

        const result = await pool.request()
            .input('Id', req.params.id)
            .input('Title', title)
            .input('Subtitle', subtitle || '')
            .input('SystemName', systemName || '')
            .input('Program', program || '')
            .input('Version', version || '')
            .input('DocumentDate', documentDate || '')
            .input('HtmlContent', cleanHtml)
            .input('BuilderState', builderState ? JSON.stringify(builderState) : null)
            .query(`
                UPDATE DataFlows 
                SET Title = @Title, Subtitle = @Subtitle, SystemName = @SystemName, 
                    Program = @Program, Version = @Version, DocumentDate = @DocumentDate, 
                    HtmlContent = @HtmlContent, BuilderState = @BuilderState
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `);

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: 'Failed to update flow' });
    }
});

const { createTixoTicket } = require('../services/tixoService');

// Trigger a sync for a flow
router.post('/:id/sync', requireContentManager, async (req, res) => {
    const flowId = req.params.id;
    // For MVP, return a generic success status
    setTimeout(() => {
        res.json({ message: `Flow ${flowId} synchronized successfully.` });
    }, 1500); // Simulate network delay
});

module.exports = router;
