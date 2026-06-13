// @ts-nocheck

async function renameTenantIdColumn(
    queryInterface: import('sequelize').QueryInterface,
    tableName: string,
): Promise<void> {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes(tableName)) {
        return;
    }

    const description = await queryInterface.describeTable(tableName);
    if ('tenantId' in description && !('orgId' in description)) {
        await queryInterface.renameColumn(tableName, 'tenantId', 'orgId');
    }
}

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    await renameTenantIdColumn(queryInterface, 'Properties');
    await renameTenantIdColumn(queryInterface, 'Units');
    await renameTenantIdColumn(queryInterface, 'Leases');
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    for (const tableName of ['Properties', 'Units', 'Leases']) {
        const tables = await queryInterface.showAllTables();
        if (!tables.includes(tableName)) {
            continue;
        }
        const description = await queryInterface.describeTable(tableName);
        if ('orgId' in description && !('tenantId' in description)) {
            await queryInterface.renameColumn(tableName, 'orgId', 'tenantId');
        }
    }
};
