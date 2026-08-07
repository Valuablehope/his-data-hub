const express = require('express');
const router  = express.Router();
const { poolPromise } = require('../db');
const { authenticateToken, requireContentManager } = require('../middleware/auth');

/* ─── shared query helpers ───────────────────────────────── */

// Returns facility rows + most-recent grant per facility.
// Pass optional WHERE clause additions and an mssql Request.
async function queryFacilities(pool, extraWhere = '', inputs = {}) {
    const req = pool.request();
    Object.entries(inputs).forEach(([k, v]) => req.input(k, v));

    const sql = `
        SELECT
            f.Id,
            f.Name,
            f.FacilityType  AS Type,
            f.Area,
            f.Base,
            f.Address,
            f.Coordinates,
            f.Status,
            f.Notes,
            f.UpdatedBy,
            f.CreatedAt,
            f.UpdatedAt     AS LastUpdated,
            g.Id            AS MainGrantId,
            g.GrantCode     AS MainGrantCode,
            g.GrantName     AS MainGrantName,
            g.DonorOrg      AS MainGrantDonor,
            g.ColorClass    AS MainGrantColor,
            fc.CoverageMonth,
            fc.CoverageYear
        FROM Facilities f
        LEFT JOIN (
            SELECT
                FacilityId, MainGrantId, CoverageMonth, CoverageYear,
                ROW_NUMBER() OVER (
                    PARTITION BY FacilityId
                    ORDER BY CoverageYear DESC, CoverageMonth DESC
                ) AS rn
            FROM FacilityCoverage
        ) fc ON fc.FacilityId = f.Id AND fc.rn = 1
        LEFT JOIN Grants g ON g.Id = fc.MainGrantId
        WHERE f.IsActive = 1
        ${extraWhere}
        ORDER BY f.Name
    `;

    const result = await req.query(sql);
    return result.recordset.map(row => ({
        id:          row.Id,
        name:        row.Name,
        type:        row.Type,
        area:        row.Area,
        base:        row.Base,
        address:     row.Address,
        coordinates: row.Coordinates,
        status:      row.Status,
        notes:       row.Notes,
        updatedBy:   row.UpdatedBy,
        createdAt:   row.CreatedAt,
        lastUpdated: row.LastUpdated,
        coverageMonth: row.CoverageMonth,
        coverageYear:  row.CoverageYear,
        mainGrant: row.MainGrantId ? {
            id:     row.MainGrantId,
            code:   row.MainGrantCode,
            name:   row.MainGrantName,
            donor:  row.MainGrantDonor,
            color:  row.MainGrantColor,
        } : null,
        secondaryGrants: [], // populated separately for detail views
    }));
}

/* ─── GET /api/facilities ────────────────────────────────── */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const { search, type, area, base, status, mainGrant } = req.query;

        const conditions = [];
        const inputs = {};

        if (search) {
            conditions.push(`(f.Name LIKE @search OR f.Area LIKE @search OR f.Base LIKE @search OR f.FacilityType LIKE @search)`);
            inputs.search = `%${search}%`;
        }
        if (type)      { conditions.push('f.FacilityType = @type');   inputs.type      = type;      }
        if (area)      { conditions.push('f.Area = @area');            inputs.area      = area;      }
        if (base)      { conditions.push('f.Base = @base');            inputs.base      = base;      }
        if (status)    { conditions.push('f.Status = @status');        inputs.status    = status;    }
        if (mainGrant) { conditions.push('g.GrantCode = @mainGrant');  inputs.mainGrant = mainGrant; }

        const extraWhere = conditions.length ? 'AND ' + conditions.join(' AND ') : '';
        const facilities = await queryFacilities(pool, extraWhere, inputs);
        res.json(facilities);
    } catch (err) {
        console.error('GET /facilities error:', err);
        res.status(500).json({ error: 'Failed to fetch facilities' });
    }
});

/* ─── GET /api/facilities/meta/grants ────────────────────── */
// Must be defined BEFORE /:id to avoid route collision
router.get('/meta/grants', authenticateToken, async (req, res) => {
    try {
        const pool   = await poolPromise;
        const result = await pool.request()
            .query('SELECT Id AS id, GrantCode AS code, GrantName AS name, DonorOrg AS donor, ColorClass AS color FROM Grants ORDER BY GrantCode');
        res.json(result.recordset);
    } catch (err) {
        console.error('GET /facilities/meta/grants error:', err);
        res.status(500).json({ error: 'Failed to fetch grants' });
    }
});

/* ─── GET /api/facilities/meta/options ───────────────────── */
// Returns distinct filter values for dropdowns
router.get('/meta/options', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const [types, areas, bases, statuses] = await Promise.all([
            pool.request().query('SELECT DISTINCT FacilityType AS v FROM Facilities WHERE IsActive=1 ORDER BY v'),
            pool.request().query('SELECT DISTINCT Area AS v FROM Facilities WHERE IsActive=1 ORDER BY v'),
            pool.request().query('SELECT DISTINCT Base AS v FROM Facilities WHERE IsActive=1 ORDER BY v'),
            pool.request().query('SELECT DISTINCT Status AS v FROM Facilities WHERE IsActive=1 ORDER BY v'),
        ]);
        res.json({
            types:    types.recordset.map(r => r.v),
            areas:    areas.recordset.map(r => r.v),
            bases:    bases.recordset.map(r => r.v),
            statuses: statuses.recordset.map(r => r.v),
        });
    } catch (err) {
        console.error('GET /facilities/meta/options error:', err);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
});

/* ─── GET /api/facilities/:id ────────────────────────────── */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const rows = await queryFacilities(pool, 'AND f.Id = @facId', { facId: parseInt(req.params.id) });

        if (!rows.length) return res.status(404).json({ error: 'Facility not found' });

        const facility = rows[0];

        // Fetch current month's secondary grants (latest coverage record)
        const secResult = await pool.request()
            .input('FacilityId', facility.id)
            .query(`
                SELECT TOP 1 fc.Id AS CoverageId
                FROM FacilityCoverage fc
                WHERE fc.FacilityId = @FacilityId
                ORDER BY fc.CoverageYear DESC, fc.CoverageMonth DESC
            `);

        if (secResult.recordset.length) {
            const covId = secResult.recordset[0].CoverageId;
            const secGrants = await pool.request()
                .input('CovId', covId)
                .query(`
                    SELECT g.Id AS id, g.GrantCode AS code, g.GrantName AS name,
                           g.DonorOrg AS donor, g.ColorClass AS color
                    FROM FacilitySecondaryGrants fsg
                    JOIN Grants g ON g.Id = fsg.GrantId
                    WHERE fsg.FacilityCoverageId = @CovId
                `);
            facility.secondaryGrants = secGrants.recordset;
        }

        res.json(facility);
    } catch (err) {
        console.error('GET /facilities/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch facility' });
    }
});

/* ─── POST /api/facilities ───────────────────────────────── */
router.post('/', requireContentManager, async (req, res) => {
    const { name, type, area, base, address, coordinates, status, notes, updatedBy } = req.body;
    if (!name || !type || !area || !base) {
        return res.status(400).json({ error: 'name, type, area and base are required' });
    }
    try {
        const pool   = await poolPromise;
        const result = await pool.request()
            .input('Name',         name)
            .input('FacilityType', type)
            .input('Area',         area)
            .input('Base',         base)
            .input('Address',      address     || null)
            .input('Coordinates',  coordinates || null)
            .input('Status',       status      || 'Active')
            .input('Notes',        notes       || null)
            .input('UpdatedBy',    updatedBy   || 'admin')
            .query(`
                INSERT INTO Facilities (Name, FacilityType, Area, Base, Address, Coordinates, Status, Notes, UpdatedBy)
                OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.FacilityType AS Type, INSERTED.Area, INSERTED.Base,
                       INSERTED.Address, INSERTED.Coordinates, INSERTED.Status, INSERTED.Notes,
                       INSERTED.UpdatedBy, INSERTED.CreatedAt, INSERTED.UpdatedAt AS LastUpdated
                VALUES (@Name, @FacilityType, @Area, @Base, @Address, @Coordinates, @Status, @Notes, @UpdatedBy)
            `);
        const row = result.recordset[0];
        res.status(201).json({ ...row, mainGrant: null, secondaryGrants: [] });
    } catch (err) {
        console.error('POST /facilities error:', err);
        res.status(500).json({ error: 'Failed to create facility' });
    }
});

/* ─── PUT /api/facilities/:id ────────────────────────────── */
router.put('/:id', requireContentManager, async (req, res) => {
    const { name, type, area, base, address, coordinates, status, notes, updatedBy } = req.body;
    if (!name || !type || !area || !base) {
        return res.status(400).json({ error: 'name, type, area and base are required' });
    }
    try {
        const pool   = await poolPromise;
        const result = await pool.request()
            .input('Id',           parseInt(req.params.id))
            .input('Name',         name)
            .input('FacilityType', type)
            .input('Area',         area)
            .input('Base',         base)
            .input('Address',      address     || null)
            .input('Coordinates',  coordinates || null)
            .input('Status',       status      || 'Active')
            .input('Notes',        notes       || null)
            .input('UpdatedBy',    updatedBy   || 'admin')
            .query(`
                UPDATE Facilities
                SET Name=@Name, FacilityType=@FacilityType, Area=@Area, Base=@Base,
                    Address=@Address, Coordinates=@Coordinates, Status=@Status,
                    Notes=@Notes, UpdatedBy=@UpdatedBy, UpdatedAt=GETDATE()
                OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.FacilityType AS Type,
                       INSERTED.Area, INSERTED.Base, INSERTED.Status, INSERTED.UpdatedAt AS LastUpdated
                WHERE Id=@Id AND IsActive=1
            `);
        if (!result.recordset.length) return res.status(404).json({ error: 'Facility not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('PUT /facilities/:id error:', err);
        res.status(500).json({ error: 'Failed to update facility' });
    }
});

/* ─── DELETE /api/facilities/:id (soft delete) ───────────── */
router.delete('/:id', requireContentManager, async (req, res) => {
    try {
        const pool   = await poolPromise;
        const result = await pool.request()
            .input('Id', parseInt(req.params.id))
            .query(`UPDATE Facilities SET IsActive=0, UpdatedAt=GETDATE() WHERE Id=@Id AND IsActive=1`);
        if (!result.rowsAffected[0]) return res.status(404).json({ error: 'Facility not found' });
        res.json({ message: 'Facility deleted' });
    } catch (err) {
        console.error('DELETE /facilities/:id error:', err);
        res.status(500).json({ error: 'Failed to delete facility' });
    }
});

/* ─── GET /api/facilities/:id/coverage ──────────────────── */
router.get('/:id/coverage', authenticateToken, async (req, res) => {
    try {
        const pool  = await poolPromise;
        const facId = parseInt(req.params.id);
        const year  = req.query.year ? parseInt(req.query.year) : null;

        let sql = `
            SELECT
                fc.Id, fc.CoverageMonth, fc.CoverageYear, fc.CoverageStatus,
                fc.CoveragePeriodStart, fc.CoveragePeriodEnd,
                fc.ActivitiesCovered AS Activities,
                fc.CoverageNotes     AS Notes,
                fc.UpdatedBy, fc.UpdatedAt,
                g.Id        AS MainGrantId,
                g.GrantCode AS MainGrantCode,
                g.GrantName AS MainGrantName,
                g.DonorOrg  AS MainGrantDonor,
                g.ColorClass AS MainGrantColor
            FROM FacilityCoverage fc
            JOIN Grants g ON g.Id = fc.MainGrantId
            WHERE fc.FacilityId = @FacilityId
        `;
        const req2 = pool.request().input('FacilityId', facId);
        if (year) { sql += ' AND fc.CoverageYear = @Year'; req2.input('Year', year); }
        sql += ' ORDER BY fc.CoverageYear DESC, fc.CoverageMonth DESC';

        const result = await req2.query(sql);
        const coverageIds = result.recordset.map(r => r.Id);

        // Fetch secondary grants in one shot
        let secMap = {};
        if (coverageIds.length) {
            const secResult = await pool.request().query(`
                SELECT fsg.FacilityCoverageId, g.Id AS id, g.GrantCode AS code,
                       g.GrantName AS name, g.DonorOrg AS donor, g.ColorClass AS color
                FROM FacilitySecondaryGrants fsg
                JOIN Grants g ON g.Id = fsg.GrantId
                WHERE fsg.FacilityCoverageId IN (${coverageIds.join(',')})
            `);
            secResult.recordset.forEach(row => {
                if (!secMap[row.FacilityCoverageId]) secMap[row.FacilityCoverageId] = [];
                secMap[row.FacilityCoverageId].push({ id: row.id, code: row.code, name: row.name, donor: row.donor, color: row.color });
            });
        }

        const coverage = result.recordset.map(r => ({
            id:          r.Id,
            month:       r.CoverageMonth,
            year:        r.CoverageYear,
            status:      r.CoverageStatus,
            periodStart: r.CoveragePeriodStart,
            periodEnd:   r.CoveragePeriodEnd,
            activities:  r.Activities,
            notes:       r.Notes,
            updatedBy:   r.UpdatedBy,
            updatedAt:   r.UpdatedAt,
            mainGrant: {
                id:    r.MainGrantId,
                code:  r.MainGrantCode,
                name:  r.MainGrantName,
                donor: r.MainGrantDonor,
                color: r.MainGrantColor,
            },
            secondaryGrants: secMap[r.Id] || [],
        }));

        res.json(coverage);
    } catch (err) {
        console.error('GET /facilities/:id/coverage error:', err);
        res.status(500).json({ error: 'Failed to fetch coverage history' });
    }
});

/* ─── POST /api/facilities/:id/coverage ─────────────────── */
router.post('/:id/coverage', requireContentManager, async (req, res) => {
    const { mainGrantId, secondaryGrantIds = [], month, year, status,
            periodStart, periodEnd, activities, notes, updatedBy } = req.body;
    if (!mainGrantId || !month || !year) {
        return res.status(400).json({ error: 'mainGrantId, month and year are required' });
    }
    try {
        const pool  = await poolPromise;
        const facId = parseInt(req.params.id);

        const mergeResult = await pool.request()
            .input('FacilityId',  facId)
            .input('MainGrantId', mainGrantId)
            .input('Month',       month)
            .input('Year',        year)
            .input('Status',      status      || 'Active')
            .input('PeriodStart', periodStart || null)
            .input('PeriodEnd',   periodEnd   || null)
            .input('Activities',  activities  || null)
            .input('Notes',       notes       || null)
            .input('UpdatedBy',   updatedBy   || 'admin')
            .query(`
                MERGE FacilityCoverage AS tgt
                USING (SELECT @FacilityId AS FacilityId, @Month AS CoverageMonth, @Year AS CoverageYear) AS src
                ON  tgt.FacilityId    = src.FacilityId
                AND tgt.CoverageMonth = src.CoverageMonth
                AND tgt.CoverageYear  = src.CoverageYear
                WHEN MATCHED THEN UPDATE SET
                    MainGrantId=@MainGrantId, CoverageStatus=@Status,
                    CoveragePeriodStart=@PeriodStart, CoveragePeriodEnd=@PeriodEnd,
                    ActivitiesCovered=@Activities, CoverageNotes=@Notes,
                    UpdatedBy=@UpdatedBy, UpdatedAt=GETDATE()
                WHEN NOT MATCHED THEN INSERT
                    (FacilityId, MainGrantId, CoverageMonth, CoverageYear, CoverageStatus,
                     CoveragePeriodStart, CoveragePeriodEnd, ActivitiesCovered, CoverageNotes, UpdatedBy)
                VALUES (@FacilityId,@MainGrantId,@Month,@Year,@Status,
                        @PeriodStart,@PeriodEnd,@Activities,@Notes,@UpdatedBy)
                OUTPUT INSERTED.Id;
            `);

        const coverageId = mergeResult.recordset[0].Id;

        await pool.request().input('CoverageId', coverageId)
            .query('DELETE FROM FacilitySecondaryGrants WHERE FacilityCoverageId=@CoverageId');

        for (const gId of secondaryGrantIds) {
            await pool.request()
                .input('CoverageId', coverageId)
                .input('GrantId',    gId)
                .query('INSERT INTO FacilitySecondaryGrants (FacilityCoverageId, GrantId) VALUES (@CoverageId, @GrantId)');
        }

        res.status(201).json({ id: coverageId, message: 'Coverage record saved' });
    } catch (err) {
        console.error('POST /facilities/:id/coverage error:', err);
        res.status(500).json({ error: 'Failed to save coverage record' });
    }
});

module.exports = router;
