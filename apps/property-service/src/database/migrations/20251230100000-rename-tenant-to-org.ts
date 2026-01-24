// @ts-nocheck
import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.renameColumn('Properties', 'tenantId', 'orgId');
    await queryInterface.renameColumn('Units', 'tenantId', 'orgId');
    await queryInterface.renameColumn('Leases', 'tenantId', 'orgId'); // Renaming the isolation column
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.renameColumn('Properties', 'orgId', 'tenantId');
    await queryInterface.renameColumn('Units', 'orgId', 'tenantId');
    await queryInterface.renameColumn('Leases', 'orgId', 'tenantId');
};
