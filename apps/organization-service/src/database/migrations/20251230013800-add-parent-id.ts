import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    try {
        await queryInterface.addColumn('Tenants', 'parentId', {
            type: DataTypes.UUID,
            allowNull: true,
        });
    } catch (error) {
        console.warn('Migration add-parent-id failed (likely already exists):', error);
    }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    try {
        await queryInterface.removeColumn('Tenants', 'parentId');
    } catch (error) {
        console.warn('Migration remove-parent-id failed:', error);
    }
};
