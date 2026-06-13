import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }: { context: { getQueryInterface: () => import('sequelize').QueryInterface } }) => {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('Tenants');

    if (!('parentId' in tableDescription)) {
        await queryInterface.addColumn('Tenants', 'parentId', {
            type: DataTypes.UUID,
            allowNull: true,
        });
    }
};

export const down = async ({ context: sequelize }: { context: { getQueryInterface: () => import('sequelize').QueryInterface } }) => {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('Tenants');

    if ('parentId' in tableDescription) {
        await queryInterface.removeColumn('Tenants', 'parentId');
    }
};
