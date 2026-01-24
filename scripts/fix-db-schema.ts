
const { Client } = require('pg');

async function fixSchema() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'rentease',
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const res = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        
        const tableNames = res.rows.map(t => t.table_name);
        console.log('Tables found:', tableNames);

        const hasOld = tableNames.includes('UserTenantMemberships');
        const hasNew = tableNames.includes('UserOrganizationMemberships');

        if (hasOld && !hasNew) {
            console.log('Renaming UserTenantMemberships to UserOrganizationMemberships...');
            await client.query('ALTER TABLE "UserTenantMemberships" RENAME TO "UserOrganizationMemberships";');
            console.log('Renaming tenantId column to orgId...');
            await client.query('ALTER TABLE "UserOrganizationMemberships" RENAME COLUMN "tenantId" TO "orgId";');
            console.log('Done.');
        } else if (hasNew) {
            console.log('UserOrganizationMemberships already exists.');
             // Check column
             const cols = await client.query(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'UserOrganizationMemberships'"
             );
             const colNames = cols.rows.map(c => c.column_name);
             if (colNames.includes('tenantId')) {
                 console.log('Renaming tenantId column to orgId...');
                 await client.query('ALTER TABLE "UserOrganizationMemberships" RENAME COLUMN "tenantId" TO "orgId";');
             } else {
                 console.log('Column orgId appears to be correct (or tenantId missing).');
             }

        } else {
            console.log('Neither table found? Odd.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

fixSchema();
