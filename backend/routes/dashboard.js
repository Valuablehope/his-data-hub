const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const { RESOLVED_STATUS_SQL, AVAILABILITY_JOIN_SQL } = require('../utils/availabilityStatus');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;

        const [
            docsRes, filesRes,
            facilitiesRes, teamRes,
            linksRes, flowCountRes, latestFlowsRes
        ] = await Promise.all([
            pool.request().query('SELECT COUNT(*) AS cnt FROM Documents WHERE IsPublished = 1'),
            pool.request().query('SELECT COUNT(*) AS cnt FROM UploadedFiles'),

            pool.request().query(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS active
                FROM Facilities WHERE IsActive = 1
            `),

            pool.request().query(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN ResolvedStatus = 'Online' THEN 1 ELSE 0 END) AS online
                FROM (
                    SELECT ${RESOLVED_STATUS_SQL} AS ResolvedStatus
                    FROM Users u
                    ${AVAILABILITY_JOIN_SQL}
                    WHERE u.IsActive = 1 AND u.ShowOnDashboard = 1
                ) t
            `),

            pool.request().query('SELECT COUNT(*) AS cnt FROM ProjectLinks WHERE IsActive = 1'),

            // Unique flow documents (one per version group)
            pool.request().query(`
                SELECT COUNT(DISTINCT ISNULL(FlowGroupId, Id)) AS cnt
                FROM DataFlows WHERE IsActive = 1
            `),

            // Latest version per flow group, most recent 3
            pool.request().query(`
                SELECT TOP 3 Id, Title, Subtitle, SystemName, Program, Version, DocumentDate
                FROM (
                    SELECT *,
                        ROW_NUMBER() OVER (
                            PARTITION BY ISNULL(FlowGroupId, Id)
                            ORDER BY CreatedAt DESC
                        ) AS rn
                    FROM DataFlows WHERE IsActive = 1
                ) t
                WHERE rn = 1
                ORDER BY CreatedAt DESC
            `)
        ]);

        const fac = facilitiesRes.recordset[0];
        const team = teamRes.recordset[0];

        res.json({
            stats: {
                activeDocs:      docsRes.recordset[0].cnt,
                uploadedFiles:   filesRes.recordset[0].cnt,
                activeFlows:     flowCountRes.recordset[0].cnt,
            totalFacilities: fac.total,
                activeFacilities: fac.active,
                teamTotal:       team.total,
                teamOnline:      team.online ?? 0,
                projectLinks:    linksRes.recordset[0].cnt,
            },
            latestFlows: latestFlowsRes.recordset,
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to load dashboard stats' });
    }
});

module.exports = router;
