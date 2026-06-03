const { poolPromise } = require('./db');

async function patch() {
    const pool = await poolPromise;

    const result = await pool.request()
        .input('Id', 3)
        .query('SELECT HtmlContent FROM DataFlows WHERE Id = @Id');

    if (!result.recordset.length) {
        console.error('Flow ID 3 not found.');
        process.exit(1);
    }

    let html = result.recordset[0].HtmlContent;

    // Remove "(Persons Under Investigation)" expansion
    html = html.replace(' (Persons Under Investigation)', '');

    // Remove the entire second sentence about EPI expansion
    html = html.replace(
        ' Since PUI-registered patients have a direct vaccination pathway, this procedure applies specifically to patients whose immunization data is tracked through the <strong>EPI (Expanded Programme on Immunization)</strong> module.',
        ''
    );

    await pool.request()
        .input('Id', 3)
        .input('HtmlContent', html)
        .query('UPDATE DataFlows SET HtmlContent = @HtmlContent WHERE Id = @Id');

    console.log('Patched successfully.');
    process.exit(0);
}

patch().catch(err => { console.error(err); process.exit(1); });
