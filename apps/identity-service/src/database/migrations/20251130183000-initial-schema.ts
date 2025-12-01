// @ts-nocheck
import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    // Create Users table
    await queryInterface.createTable('Users', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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

    // Create Roles table
    await queryInterface.createTable('Roles', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
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

    // Create Permissions table
    await queryInterface.createTable('Permissions', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        resource: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
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

    // Create UserRoles junction table
    await queryInterface.createTable('UserRoles', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Roles',
                key: 'id',
            },
            onDelete: 'CASCADE',
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

    // Create RolePermissions junction table
    await queryInterface.createTable('RolePermissions', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Roles',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        permissionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Permissions',
                key: 'id',
            },
            onDelete: 'CASCADE',
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

    // Create UserTenantMemberships table
    await queryInterface.createTable('UserTenantMemberships', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Roles',
                key: 'id',
            },
            onDelete: 'SET NULL',
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
    await queryInterface.addIndex('Users', ['email'], { unique: true });
    await queryInterface.addIndex('UserRoles', ['userId', 'roleId'], { unique: true });
    await queryInterface.addIndex('RolePermissions', ['roleId', 'permissionId'], { unique: true });
    await queryInterface.addIndex('UserTenantMemberships', ['userId', 'tenantId']);
    await queryInterface.addIndex('UserTenantMemberships', ['tenantId']);
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    // Drop tables in reverse order (respecting foreign keys)
    await queryInterface.dropTable('UserTenantMemberships');
    await queryInterface.dropTable('RolePermissions');
    await queryInterface.dropTable('UserRoles');
    await queryInterface.dropTable('Permissions');
    await queryInterface.dropTable('Roles');
    await queryInterface.dropTable('Users');
};
