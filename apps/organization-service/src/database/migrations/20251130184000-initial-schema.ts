// @ts-nocheck

import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    // Create Tenants table
    await queryInterface.createTable('Tenants', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contactEmail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contactPhone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        zipCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    // Create Invitations table
    await queryInterface.createTable('Invitations', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenantId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Tenants',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending',
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    // Add indexes
    await queryInterface.addIndex('Tenants', ['name']);
    await queryInterface.addIndex('Invitations', ['tenantId']);
    await queryInterface.addIndex('Invitations', ['email']);
    await queryInterface.addIndex('Invitations', ['token'], { unique: true });
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.dropTable('Invitations');
    await queryInterface.dropTable('Tenants');
};
