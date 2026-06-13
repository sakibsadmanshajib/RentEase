// @ts-nocheck
import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const hasOldTable = tables.some(
        (t: string) => t === 'UserTenantMemberships' || t.endsWith('.UserTenantMemberships'),
    );
    const hasNewTable = tables.some(
        (t: string) => t === 'UserOrganizationMemberships' || t.endsWith('.UserOrganizationMemberships'),
    );

    if (hasOldTable && !hasNewTable) {
        await queryInterface.renameTable('UserTenantMemberships', 'UserOrganizationMemberships');
        await queryInterface.renameColumn('UserOrganizationMemberships', 'tenantId', 'orgId');
    } else if (hasNewTable) {
        const tableDesc = await queryInterface.describeTable('UserOrganizationMemberships');
        if (tableDesc.tenantId && !tableDesc.orgId) {
            await queryInterface.renameColumn('UserOrganizationMemberships', 'tenantId', 'orgId');
        }
    }
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const hasNewTable = tables.some(
        (t: string) => t === 'UserOrganizationMemberships' || t.endsWith('.UserOrganizationMemberships'),
    );

    if (hasNewTable) {
        const tableDesc = await queryInterface.describeTable('UserOrganizationMemberships');
        if (tableDesc.orgId) {
            await queryInterface.renameColumn('UserOrganizationMemberships', 'orgId', 'tenantId');
        }
        await queryInterface.renameTable('UserOrganizationMemberships', 'UserTenantMemberships');
    }
};
