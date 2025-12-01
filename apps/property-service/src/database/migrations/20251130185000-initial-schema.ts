// @ts-nocheck

import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    // Create Properties table
    await queryInterface.createTable('Properties', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
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
        emergencyPhone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
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

    // Create Units table
    await queryInterface.createTable('Units', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        propertyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Properties',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        unitNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bedrooms: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        bathrooms: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
        },
        floor: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        squareFeet: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'available',
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

    // Create Leases table
    await queryInterface.createTable('Leases', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        propertyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Properties',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        unitId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Units',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        monthlyRent: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        securityDeposit: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'draft',
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

    // Create LeaseOccupants table
    await queryInterface.createTable('LeaseOccupants', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        leaseId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Leases',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isPrimaryTenant: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
    await queryInterface.addIndex('Properties', ['tenantId']);
    await queryInterface.addIndex('Units', ['tenantId']);
    await queryInterface.addIndex('Units', ['propertyId']);
    await queryInterface.addIndex('Units', ['propertyId', 'unitNumber'], { unique: true });
    await queryInterface.addIndex('Leases', ['tenantId']);
    await queryInterface.addIndex('Leases', ['propertyId']);
    await queryInterface.addIndex('Leases', ['unitId']);
    await queryInterface.addIndex('LeaseOccupants', ['leaseId']);
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.dropTable('LeaseOccupants');
    await queryInterface.dropTable('Leases');
    await queryInterface.dropTable('Units');
    await queryInterface.dropTable('Properties');
};
