const { poolPromise, sql } = require('./db');

async function patch() {
    const pool = await poolPromise;

    // Locate the flow — finds by original Program name in case Id differs across environments
    const result = await pool.request()
        .query(`SELECT Id, Title, Program, HtmlContent FROM DataFlows WHERE Program = 'Hospital Deliveries' AND IsActive = 1`);

    if (!result.recordset.length) {
        console.log('No flow found with Program = "Hospital Deliveries". Nothing to do.');
        process.exit(0);
    }

    const flow = result.recordset[0];
    console.log(`Found flow Id=${flow.Id} — "${flow.Title}" (Program: ${flow.Program})`);

    // ── 1. Update metadata columns ──────────────────────────────
    await pool.request()
        .input('Id',      sql.Int,     flow.Id)
        .input('Title',   sql.VarChar, 'ER, Deliveries, Surgeries and In-Patients (Including NICU)')
        .input('Program', sql.VarChar, 'Hospitalization')
        .query(`UPDATE DataFlows SET Title = @Title, Program = @Program WHERE Id = @Id`);

    console.log('Metadata updated.');

    // ── 2. Replace occurrences in HtmlContent ───────────────────
    // Order matters: most specific phrases first to avoid double-replacing.
    let html = flow.HtmlContent;

    html = html.replace(/Hospital Deliveries Program/g,                    'Hospitalization');
    html = html.replace(/Hospital Deliveries &mdash; System Data Flow/g,   'Hospitalization — System Data Flow');
    html = html.replace(/Hospital Deliveries module within PHENICS/g,      'Hospitalization module within PHENICS');
    html = html.replace(/hospital deliveries service program/g,            'hospitalization service program');
    html = html.replace(/hospital deliveries and the associated/gi,        'hospitalization and the associated');
    html = html.replace(/hospital deliveries/gi,                           'Hospitalization');
    html = html.replace(/Hospital Deliveries/g,                            'Hospitalization');

    await pool.request()
        .input('Id',          sql.Int,          flow.Id)
        .input('HtmlContent', sql.NVarChar(sql.MAX), html)
        .query(`UPDATE DataFlows SET HtmlContent = @HtmlContent WHERE Id = @Id`);

    console.log('HtmlContent updated.');
    console.log('Done.');
    process.exit(0);
}

patch().catch(err => { console.error(err); process.exit(1); });
