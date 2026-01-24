
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'rentease',
});

async function renameTenants() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const res = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        const tableNames = res.rows.map(t => t.table_name);
        const tableNamesLower = new Set(tableNames.map(t => t.toLowerCase()));

        if (tableNamesLower.has('tenants') && !tableNamesLower.has('organizations')) {
            // Find actual table name (preserves case)
            const actualTableName = tableNames.find(t => t.toLowerCase() === 'tenants');
            console.log(`Renaming ${actualTableName} to Organizations...`);
            await client.query(`ALTER TABLE "${actualTableName}" RENAME TO "Organizations";`);
            console.log('Done.');
        } else {
            console.log('Tenants table not found or Organizations already exists.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

renameTenants();
