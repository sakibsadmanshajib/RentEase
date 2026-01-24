
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
        
        if (tableNames.includes('Tenants') && !tableNames.includes('Organizations')) {
            console.log('Renaming Tenants to Organizations...');
            await client.query('ALTER TABLE "Tenants" RENAME TO "Organizations";');
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
