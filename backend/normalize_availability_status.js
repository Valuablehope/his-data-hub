// One-off data fix: some Availabilities rows were set to non-canonical Status values
// (e.g. 'Available') outside the app, before the PUT /api/availability whitelist existed.
// Normalizes any such row to 'Online'. Safe to re-run — it's a no-op once clean.
const { poolPromise } = require('./db');
const { AVAILABILITY_STATUSES } = require('./utils/availabilityStatus');

async function normalize() {
    const pool = await poolPromise;
    const validList = [...AVAILABILITY_STATUSES, 'Offline'];
    const placeholders = validList.map((_, i) => `@v${i}`).join(', ');

    const request = pool.request();
    validList.forEach((v, i) => request.input(`v${i}`, v));

    const before = await request.query(`
        SELECT u.Username, a.Status
        FROM Availabilities a
        JOIN Users u ON u.Id = a.UserId
        WHERE a.Status NOT IN (${placeholders})
    `);

    if (!before.recordset.length) {
        console.log('No non-canonical Status values found. Nothing to do.');
        process.exit(0);
    }

    console.log('Normalizing these rows to \'Online\':');
    before.recordset.forEach(r => console.log(`  ${r.Username}: '${r.Status}' -> 'Online'`));

    const updateRequest = pool.request();
    validList.forEach((v, i) => updateRequest.input(`v${i}`, v));
    const result = await updateRequest.query(`
        UPDATE Availabilities
        SET Status = 'Online'
        WHERE Status NOT IN (${placeholders})
    `);

    console.log(`Updated ${result.rowsAffected[0]} row(s).`);
    process.exit(0);
}

normalize().catch(err => { console.error(err); process.exit(1); });
