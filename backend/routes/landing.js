const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const { RESOLVED_STATUS_SQL, AVAILABILITY_JOIN_SQL } = require('../utils/availabilityStatus');

// Public, unauthenticated snapshot for the landing page: aggregate counts only
// (team status is an online/total ratio, never individual names).
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;

        const [
            facilitiesRes, flowCountRes, docsRes, teamRes,
            programmesRes, activityRes,
        ] = await Promise.all([
            pool.request().query(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS active
                FROM Facilities WHERE IsActive = 1
            `),

            pool.request().query(`
                SELECT COUNT(DISTINCT ISNULL(FlowGroupId, Id)) AS cnt
                FROM DataFlows WHERE IsActive = 1
            `),

            pool.request().query('SELECT COUNT(*) AS cnt FROM Documents WHERE IsPublished = 1'),

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

            // Real programme areas only — excludes the internal team-structure flow.
            pool.request().query(`
                SELECT Program, COUNT(DISTINCT ISNULL(FlowGroupId, Id)) AS cnt
                FROM DataFlows
                WHERE IsActive = 1 AND Program <> 'Team Structure & Data Flows'
                GROUP BY Program
            `),

            // Latest published SOPs + latest-per-flow-group manuals, merged and sorted by real date.
            pool.request().query(`
                SELECT TOP 6 Type, Id, Title, Subtitle, ActivityDate
                FROM (
                    SELECT 'document' AS Type, Id, Title, Category AS Subtitle, UpdatedAt AS ActivityDate
                    FROM Documents WHERE IsPublished = 1

                    UNION ALL

                    SELECT 'flow' AS Type, Id, Title, Program AS Subtitle, CreatedAt AS ActivityDate
                    FROM (
                        SELECT *,
                            ROW_NUMBER() OVER (
                                PARTITION BY ISNULL(FlowGroupId, Id)
                                ORDER BY CreatedAt DESC
                            ) AS rn
                        FROM DataFlows
                        WHERE IsActive = 1 AND Program <> 'Team Structure & Data Flows'
                    ) latest WHERE rn = 1
                ) combined
                ORDER BY ActivityDate DESC
            `),
        ]);

        const fac = facilitiesRes.recordset[0];
        const team = teamRes.recordset[0];

        res.json({
            facilities: { total: fac.total, active: fac.active },
            flowManuals: flowCountRes.recordset[0].cnt,
            publishedDocs: docsRes.recordset[0].cnt,
            team: { total: team.total, online: team.online ?? 0 },
            programmes: programmesRes.recordset,
            recentActivity: activityRes.recordset,
        });
    } catch (err) {
        console.error('Landing stats error:', err);
        res.status(500).json({ error: 'Failed to load landing page data' });
    }
});

module.exports = router;
