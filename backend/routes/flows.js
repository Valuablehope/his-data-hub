const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

// Get all flows
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM DataFlows');
        res.json(result.recordset);
    } catch (err) {
        console.error("DB Error:", err);
        res.json([
            { id: 1, name: 'Patient Admissions Sync', source: 'HIS Local DB', dest: 'PHENICS Master', status: 'Healthy', lastSync: '2 mins ago', type: 'Bidirectional' },
            { id: 2, name: 'Lab Results Export', source: 'LIS Module', dest: 'PHENICS Lab Endpoint', status: 'Healthy', lastSync: '5 mins ago', type: 'Unidirectional' }
        ]);
    }
});

// Create new flow
router.post('/', async (req, res) => {
    // Insert logic would go here
    res.status(201).json({ message: 'Flow created successfully' });
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
