const { poolPromise } = require('./db');

async function migrate() {
    try {
        const pool = await poolPromise;

        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'DataFlows' AND COLUMN_NAME = 'FlowGroupId'
            )
            ALTER TABLE DataFlows ADD FlowGroupId INT NULL;
        `);
        console.log('FlowGroupId column ready.');

        // Self-assign group ID to all flows that don't have one yet
        await pool.request().query(`
            UPDATE DataFlows SET FlowGroupId = Id WHERE FlowGroupId IS NULL;
        `);
        console.log('FlowGroupId populated for existing records.');

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
