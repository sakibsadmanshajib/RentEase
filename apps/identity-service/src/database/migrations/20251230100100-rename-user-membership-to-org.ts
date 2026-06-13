// @ts-nocheck

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const hasOldTable = tables.some((table) => table === 'UserTenantMemberships' || table.endsWith('.UserTenantMemberships'));
    const hasNewTable = tables.some((table) => table === 'UserOrganizationMemberships' || table.endsWith('.UserOrganizationMemberships'));

    if (!hasOldTable && !hasNewTable) {
        return;
    }

    if (hasOldTable) {
        const description = await queryInterface.describeTable('UserTenantMemberships');
        if ('tenantId' in description && !('orgId' in description)) {
            await queryInterface.renameColumn('UserTenantMemberships', 'tenantId', 'orgId');
        }
        if (!hasNewTable) {
            await queryInterface.renameTable('UserTenantMemberships', 'UserOrganizationMemberships');
        }
    } else if (hasNewTable) {
        const description = await queryInterface.describeTable('UserOrganizationMemberships');
        if ('tenantId' in description && !('orgId' in description)) {
            await queryInterface.renameColumn('UserOrganizationMemberships', 'tenantId', 'orgId');
        }
    }
};

export const down = async ({ context: sequelize }) => {
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
