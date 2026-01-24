// @ts-nocheck
import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    // UserTenantMemberships
    await queryInterface.renameColumn('UserTenantMemberships', 'tenantId', 'orgId');
    // Rename Table to match domain? Maybe later. For now just the column.
    // Actually, let's rename the table too if we are renaming the service constraints? 
    // Plan only said "Rename Isolation Column". But "UserTenantMemberships" sounds bad.
    // Let's stick to column rename first to be safe, as Plan Step 1 was focused on 'orgId' column.
    // Wait, the plan says: "users / user_tenants (Rename to user_organizations / orgId)"
    
    // Rename Table: UserTenantMemberships -> UserOrganizationMemberships
    await queryInterface.renameTable('UserTenantMemberships', 'UserOrganizationMemberships');
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.renameTable('UserOrganizationMemberships', 'UserTenantMemberships');
    await queryInterface.renameColumn('UserTenantMemberships', 'orgId', 'tenantId');
};
