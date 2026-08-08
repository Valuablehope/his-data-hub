const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Internal ops dashboard for the HIS Team — KPIs and worklists distinct from
// the public landing page (which only shows aggregate counts). Team/availability
// status lives on the landing page's Meet the Team section, not here.
router.get('/', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;

        const [
            grantsRes, areasRes, coverageRes, needsAttentionRes, byAreaRes, activeGrantsRes,
        ] = await Promise.all([
            pool.request().query('SELECT COUNT(*) AS cnt FROM Grants'),

            pool.request().query('SELECT COUNT(DISTINCT Area) AS cnt FROM Facilities WHERE IsActive = 1'),

            // Coverage rate: how many active facilities have a grant-coverage record
            // logged for the current month. The gap is the HIS team's actual worklist.
            // (A LEFT JOIN + NULL check, not SUM(CASE WHEN EXISTS(...)) — SQL Server
            // rejects an EXISTS subquery as a direct argument to an aggregate.)
            pool.request().query(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN fc.FacilityId IS NOT NULL THEN 1 ELSE 0 END) AS covered
                FROM Facilities f
                LEFT JOIN (
                    SELECT DISTINCT FacilityId FROM FacilityCoverage
                    WHERE CoverageMonth = MONTH(GETDATE()) AND CoverageYear = YEAR(GETDATE())
                ) fc ON fc.FacilityId = f.Id
                WHERE f.IsActive = 1
            `),

            // Same missing-this-month filter as the coverage query above, but also
            // pulls each facility's most recent coverage record (if any) via OUTER
            // APPLY, so the worklist can say *since when* and *under what grant* —
            // not just which facilities are stale. Ordered so never-covered
            // facilities (no history at all) surface first, then oldest-lapsed.
            pool.request().query(`
                SELECT TOP 8 f.Id, f.Name, f.Area, f.Base,
                       lc.CoverageMonth AS LastMonth, lc.CoverageYear AS LastYear, g.GrantCode AS LastGrantCode
                FROM Facilities f
                OUTER APPLY (
                    SELECT TOP 1 fc.CoverageMonth, fc.CoverageYear, fc.MainGrantId
                    FROM FacilityCoverage fc
                    WHERE fc.FacilityId = f.Id
                    ORDER BY fc.CoverageYear DESC, fc.CoverageMonth DESC
                ) lc
                LEFT JOIN Grants g ON g.Id = lc.MainGrantId
                WHERE f.IsActive = 1 AND NOT EXISTS (
                    SELECT 1 FROM FacilityCoverage fc2
                    WHERE fc2.FacilityId = f.Id
                      AND fc2.CoverageMonth = MONTH(GETDATE()) AND fc2.CoverageYear = YEAR(GETDATE())
                )
                ORDER BY
                    CASE WHEN lc.CoverageYear IS NULL THEN 0 ELSE 1 END,
                    lc.CoverageYear ASC, lc.CoverageMonth ASC,
                    f.Name
            `),

            pool.request().query(`
                SELECT Area, COUNT(*) AS cnt
                FROM Facilities WHERE IsActive = 1
                GROUP BY Area
                ORDER BY cnt DESC
            `),

            // "Active" here is driven by coverage dates, not just the CoverageStatus
            // flag — nearly every coverage row is flagged 'Active' regardless of era,
            // so the real signal is whether today falls inside a covered period.
            // CoveragePeriodStart/End is a per-facility field on each coverage record
            // (not a grant-level field). A grant counts as active if ANY facility is
            // under it (as main OR secondary grant) during a period that includes
            // today. CoverageStart/End (MIN/MAX below) are computed only across
            // those currently-active rows — "the span this grant is covering right
            // now" — not an all-time aggregate over the grant's full history, which
            // would misrepresent facilities with differing periods as if they shared one.
            pool.request().query(`
                SELECT g.Id, g.GrantCode, g.GrantName, g.DonorOrg,
                       COUNT(DISTINCT combined.FacilityId) AS FacilityCount,
                       MIN(combined.PeriodStart) AS CoverageStart,
                       MAX(combined.PeriodEnd) AS CoverageEnd
                FROM Grants g
                JOIN (
                    SELECT fc.MainGrantId AS GrantId, fc.FacilityId,
                           fc.CoveragePeriodStart AS PeriodStart, fc.CoveragePeriodEnd AS PeriodEnd
                    FROM FacilityCoverage fc
                    WHERE fc.CoverageStatus = 'Active'
                      AND (fc.CoveragePeriodStart IS NULL OR fc.CoveragePeriodStart <= GETDATE())
                      AND (fc.CoveragePeriodEnd IS NULL OR fc.CoveragePeriodEnd >= GETDATE())

                    UNION ALL

                    SELECT fsg.GrantId, fc.FacilityId, fc.CoveragePeriodStart, fc.CoveragePeriodEnd
                    FROM FacilitySecondaryGrants fsg
                    JOIN FacilityCoverage fc ON fc.Id = fsg.FacilityCoverageId
                    WHERE fc.CoverageStatus = 'Active'
                      AND (fc.CoveragePeriodStart IS NULL OR fc.CoveragePeriodStart <= GETDATE())
                      AND (fc.CoveragePeriodEnd IS NULL OR fc.CoveragePeriodEnd >= GETDATE())
                ) combined ON combined.GrantId = g.Id
                GROUP BY g.Id, g.GrantCode, g.GrantName, g.DonorOrg
                ORDER BY FacilityCount DESC
            `),
        ]);

        const coverage = coverageRes.recordset[0];

        res.json({
            grantsTracked: grantsRes.recordset[0].cnt,
            areasCovered: areasRes.recordset[0].cnt,
            coverage: { total: coverage.total, covered: coverage.covered ?? 0 },
            needsAttention: needsAttentionRes.recordset.map(f => ({
                id: f.Id, name: f.Name, area: f.Area, base: f.Base,
                lastMonth: f.LastMonth, lastYear: f.LastYear, lastGrantCode: f.LastGrantCode,
            })),
            facilitiesByArea: byAreaRes.recordset.map(r => ({ area: r.Area, count: r.cnt })),
            activeGrantsCount: activeGrantsRes.recordset.length,
            activeGrants: activeGrantsRes.recordset.map(g => ({
                id: g.Id, code: g.GrantCode, name: g.GrantName, donor: g.DonorOrg,
                facilityCount: g.FacilityCount,
                coverageStart: g.CoverageStart,
                coverageEnd: g.CoverageEnd,
                durationMonths: g.CoverageStart && g.CoverageEnd
                    ? (g.CoverageEnd.getUTCFullYear() - g.CoverageStart.getUTCFullYear()) * 12
                        + (g.CoverageEnd.getUTCMonth() - g.CoverageStart.getUTCMonth()) + 1
                    : null,
            })),
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to load dashboard stats' });
    }
});

module.exports = router;
