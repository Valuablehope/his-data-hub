const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;

        const [docsRes, flowsRes, formsRes, filesRes, pendingRes, activityRes] = await Promise.all([
            pool.request().query('SELECT COUNT(*) AS cnt FROM Documents WHERE IsPublished = 1'),
            pool.request().query('SELECT COUNT(*) AS cnt FROM DataFlows WHERE IsActive = 1'),
            pool.request().query('SELECT COUNT(*) AS cnt FROM ActivityForms'),
            pool.request().query('SELECT COUNT(*) AS cnt FROM UploadedFiles'),
            pool.request().query("SELECT COUNT(*) AS cnt FROM ActivityForms WHERE Status = 'Pending'"),
            pool.request().query(`
                SELECT TOP 8
                    Id, Title, Priority, Status, SubmittedBy, TixoReferenceCode, SubmittedAt
                FROM ActivityForms
                ORDER BY SubmittedAt DESC
            `)
        ]);

        res.json({
            stats: {
                activeDocs:    docsRes.recordset[0].cnt,
                activeFlows:   flowsRes.recordset[0].cnt,
                totalForms:    formsRes.recordset[0].cnt,
                uploadedFiles: filesRes.recordset[0].cnt,
                pendingForms:  pendingRes.recordset[0].cnt,
            },
            recentActivity: activityRes.recordset
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to load dashboard stats' });
    }
});

module.exports = router;
