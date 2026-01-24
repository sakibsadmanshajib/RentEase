import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Rename table
    await queryInterface.renameTable('UserTenantMemberships', 'UserOrganizationMemberships');
    
    // Rename column
    await queryInterface.renameColumn('UserOrganizationMemberships', 'tenantId', 'orgId');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.renameColumn('UserOrganizationMemberships', 'orgId', 'tenantId');
    await queryInterface.renameTable('UserOrganizationMemberships', 'UserTenantMemberships');
  }
};
