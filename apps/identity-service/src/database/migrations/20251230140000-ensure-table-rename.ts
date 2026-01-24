import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Check if old table exists
    const tables = await queryInterface.showAllTables();
    // tables might include schema prefix, so check loosely
    const hasOldTable = tables.some(t => t === 'UserTenantMemberships' || t.endsWith('.UserTenantMemberships'));
    const hasNewTable = tables.some(t => t === 'UserOrganizationMemberships' || t.endsWith('.UserOrganizationMemberships'));

    if (hasOldTable && !hasNewTable) {
      console.log('Renaming UserTenantMemberships to UserOrganizationMemberships...');
      await queryInterface.renameTable('UserTenantMemberships', 'UserOrganizationMemberships');
      
      // Rename column
      await queryInterface.renameColumn('UserOrganizationMemberships', 'tenantId', 'orgId');
    } else {
      console.log('Skipping rename: Table state already correct or ambiguous.', { hasOldTable, hasNewTable });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Revert logic
    await queryInterface.renameColumn('UserOrganizationMemberships', 'orgId', 'tenantId');
    await queryInterface.renameTable('UserOrganizationMemberships', 'UserTenantMemberships');
  }
};
