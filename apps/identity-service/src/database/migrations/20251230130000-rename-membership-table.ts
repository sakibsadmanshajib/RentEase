export const up = async ({ context: sequelize }: { context: { getQueryInterface: () => import('sequelize').QueryInterface } }) => {
    const queryInterface = sequelize.getQueryInterface();
    let tables = await queryInterface.showAllTables();
    const hasOldTable = tables.some((table) => table === 'UserTenantMemberships' || table.endsWith('.UserTenantMemberships'));
    const hasNewTable = tables.some((table) => table === 'UserOrganizationMemberships' || table.endsWith('.UserOrganizationMemberships'));

    if (hasOldTable && !hasNewTable) {
        await queryInterface.renameTable('UserTenantMemberships', 'UserOrganizationMemberships');
        tables = await queryInterface.showAllTables();
    }

    const membershipTable = tables.find(
        (table) =>
            table === 'UserOrganizationMemberships' ||
            table.endsWith('.UserOrganizationMemberships') ||
            table === 'UserTenantMemberships' ||
            table.endsWith('.UserTenantMemberships'),
    );

    if (!membershipTable) {
        return;
    }

    const tableName = membershipTable.includes('.') ? membershipTable.split('.').pop()! : membershipTable;
    const tableDescription = await queryInterface.describeTable(tableName);
    if ('tenantId' in tableDescription && !('orgId' in tableDescription)) {
        await queryInterface.renameColumn(tableName, 'tenantId', 'orgId');
    }
};

export const down = async ({ context: sequelize }: { context: { getQueryInterface: () => import('sequelize').QueryInterface } }) => {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const hasNewTable = tables.some((table) => table === 'UserOrganizationMemberships' || table.endsWith('.UserOrganizationMemberships'));

    if (!hasNewTable) {
        return;
    }

    const tableDescription = await queryInterface.describeTable('UserOrganizationMemberships');
    if ('orgId' in tableDescription) {
        await queryInterface.renameColumn('UserOrganizationMemberships', 'orgId', 'tenantId');
    }

    await queryInterface.renameTable('UserOrganizationMemberships', 'UserTenantMemberships');
};
