
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'rentease',
});

const migrations = [
    '20251130183000-initial-schema.js',
    '20251230100000-rename-tenant-to-org.js',
    '20251230130000-rename-membership-table.js',
    '20251230140000-ensure-table-rename.js',
    '20251130184000-initial-schema.js',
    '20251130185000-initial-schema.js',
    '20251130190000-initial-schema.js'
];

async function markMigrations() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Ensure SequelizeMeta exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
                "name" VARCHAR(255) NOT NULL UNIQUE,
                PRIMARY KEY ("name")
            );
        `);

        for (const migration of migrations) {
            try {
                await client.query('INSERT INTO "SequelizeMeta" (name) VALUES ($1)', [migration]);
                console.log(`Marked ${migration} as executed.`);
            } catch (e) {
                if (e.code === '23505') { // Unique violation
                    console.log(`${migration} already marked.`);
                } else {
                    console.error(`Failed to mark ${migration}:`, e);
                }
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

markMigrations();
