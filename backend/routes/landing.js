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
            programmesRes, activityRes, teamMembersRes,
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

            // Public "Meet the Team" roster — explicit opt-in only (ShowOnPublicTeam),
            // never the internal auth Role, and never anyone who hasn't opted in.
            // Ordered by TeamTier first so the hierarchy (Leadership → Coordinator →
            // Team Member) renders in order, alphabetical within each tier. Joins the
            // same resolved-availability logic used internally (Dashboard/Availability
            // Board) so opted-in members also show their live status publicly.
            pool.request().query(`
                SELECT u.Id, u.DisplayName, u.PublicTitle, u.TeamTier,
                       CASE WHEN u.PhotoFileName IS NOT NULL THEN 1 ELSE 0 END AS HasPhoto,
                       ${RESOLVED_STATUS_SQL} AS Status
                FROM Users u
                ${AVAILABILITY_JOIN_SQL}
                WHERE u.IsActive = 1 AND u.ShowOnPublicTeam = 1
                ORDER BY u.TeamTier, u.DisplayName
            `),
        ]);

        // Queried separately (not in the Promise.all above) so a database that hasn't
        // had create_platform_links_table.js run yet still serves the rest of the
        // landing page instead of 500ing the whole endpoint.
        let platformLinks = [];
        try {
            const platformLinksRes = await pool.request().query(`
                SELECT Id, Name, Url,
                       CASE WHEN LogoFileName IS NOT NULL THEN 1 ELSE 0 END AS HasLogo
                FROM PlatformLinks
                WHERE IsActive = 1
                ORDER BY SortOrder, Name
            `);
            platformLinks = platformLinksRes.recordset.map(p => ({
                id: p.Id,
                name: p.Name,
                url: p.Url,
                hasLogo: !!p.HasLogo,
            }));
        } catch (linkErr) {
            console.error('PlatformLinks not available yet:', linkErr.message);
        }

        const fac = facilitiesRes.recordset[0];
        const team = teamRes.recordset[0];

        res.json({
            facilities: { total: fac.total, active: fac.active },
            flowManuals: flowCountRes.recordset[0].cnt,
            publishedDocs: docsRes.recordset[0].cnt,
            team: {
                total: team.total,
                online: team.online ?? 0,
                members: teamMembersRes.recordset.map(m => ({
                    id: m.Id,
                    displayName: m.DisplayName,
                    title: m.PublicTitle,
                    hasPhoto: !!m.HasPhoto,
                    tier: m.TeamTier,
                    status: m.Status,
                })),
            },
            programmes: programmesRes.recordset,
            recentActivity: activityRes.recordset,
            platformLinks,
        });
    } catch (err) {
        console.error('Landing stats error:', err);
        res.status(500).json({ error: 'Failed to load landing page data' });
    }
});

module.exports = router;
