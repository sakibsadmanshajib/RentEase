// @ts-nocheck
import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();

    if (tables.includes('Tenants') && !tables.includes('Organizations')) {
        await queryInterface.renameTable('Tenants', 'Organizations');
    }
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();

    if (tables.includes('Organizations') && !tables.includes('Tenants')) {
        await queryInterface.renameTable('Organizations', 'Tenants');
    }
};
