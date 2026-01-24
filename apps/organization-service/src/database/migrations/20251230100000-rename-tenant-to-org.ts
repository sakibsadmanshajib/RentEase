// @ts-nocheck
import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    // Verify if Tenants table has parentId (added in previous step check? yes 20251230013800-add-parent-id.ts exists)
    // We should rename parentId too if it refers to Org hierarchy? 
    // No, plan said "Remove parentId logic (Organizations are flat)". 
    // But for the migration, we should just rename the table and the FKs.
    
    await queryInterface.renameTable('Tenants', 'Organizations');
    await queryInterface.renameColumn('Invitations', 'tenantId', 'orgId'); // FK to Organizations
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.renameColumn('Invitations', 'orgId', 'tenantId');
    await queryInterface.renameTable('Organizations', 'Tenants');
};
