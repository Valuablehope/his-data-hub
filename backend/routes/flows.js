const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

// Get all flows (metadata only for list view)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT Id, Title, Subtitle, SystemName, Program, Version, DocumentDate, CreatedAt FROM DataFlows WHERE IsActive = 1 ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: 'Failed to fetch flows' });
    }
});

// Get single flow by ID
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', req.params.id)
            .query('SELECT * FROM DataFlows WHERE Id = @Id AND IsActive = 1');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: 'Failed to fetch flow' });
    }
});

// Create new flow
router.post('/', async (req, res) => {
    try {
        const { title, subtitle, systemName, program, version, documentDate, htmlContent, builderState } = req.body;
        
        if (!title || !htmlContent) {
            return res.status(400).json({ error: 'Title and HTML content are required' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Title', title)
            .input('Subtitle', subtitle || '')
            .input('SystemName', systemName || '')
            .input('Program', program || '')
            .input('Version', version || '')
            .input('DocumentDate', documentDate || '')
            .input('HtmlContent', htmlContent)
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
router.put('/:id', async (req, res) => {
    try {
        const { title, subtitle, systemName, program, version, documentDate, htmlContent, builderState } = req.body;
        
        if (!title || !htmlContent) {
            return res.status(400).json({ error: 'Title and HTML content are required' });
        }

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
            .input('HtmlContent', htmlContent)
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
router.post('/:id/sync', async (req, res) => {
    const flowId = req.params.id;
    // Simulate a sync failure
    try {
        throw new Error(`Data Sync Failure on Flow ${flowId}`);
    } catch (error) {
        console.error("Sync failed:", error.message);
        try {
            const ticket = await createTixoTicket({
                title: `Data Sync Failure on Flow ${flowId}`,
                description: `The HIS data hub failed to synchronize records for flow ${flowId} at ${new Date().toLocaleTimeString()}. Error: ${error.message}`,
                category_id: 1,
                priority: 'High',
                source_channel: 'HIS Data Hub'
            });
            res.status(500).json({ error: "Sync failed. A support ticket has been created automatically.", ticket });
        } catch (ticketError) {
            console.error("Failed to create TIXO ticket:", ticketError);
            res.status(500).json({ error: "Sync failed and unable to create support ticket." });
        }
    }
});

module.exports = router;
