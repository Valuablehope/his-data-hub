const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const { createTixoTicket } = require('../services/tixoService');
const { authenticateToken } = require('../middleware/auth');

// Submit a new activity form (Now integrated with TIXO)
router.post('/submit', authenticateToken, async (req, res) => {
    try {
        const { title, description, category_id, priority, source_channel } = req.body;
        
        // Ensure required fields are present
        if (!title || !description || !category_id) {
            return res.status(400).json({ error: 'Missing required fields: title, description, or category_id' });
        }

        const ticket = await createTixoTicket({
            title,
            description,
            category_id,
            priority: priority || 'Medium',
            source_channel: source_channel || 'HIS Data Hub Portal'
        });

        res.status(201).json({ message: 'Ticket created successfully', ticket });
    } catch (err) {
        console.error("TIXO Ticket Creation Error:", err.message);
        res.status(500).json({ error: 'Failed to submit ticket to TIXO' });
    }
});

// Get submitted forms (for admin)
router.get('/', async (req, res) => {
    res.json([]);
});

module.exports = router;
