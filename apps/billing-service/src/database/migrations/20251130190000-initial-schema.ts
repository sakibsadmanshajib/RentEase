// @ts-nocheck

import { DataTypes } from 'sequelize';

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    // Create LedgerAccounts table
    await queryInterface.createTable('LedgerAccounts', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
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

    // Create LedgerEntries table
    await queryInterface.createTable('LedgerEntries', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accountId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'LedgerAccounts',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        journalId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        debit: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        credit: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'USD',
        },
        correlationId: {
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

    // Create Invoices table
    await queryInterface.createTable('Invoices', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        leaseId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        invoiceNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        issueDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        periodStart: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        periodEnd: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'USD',
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'PENDING',
        },
        lineItems: {
            type: DataTypes.JSON,
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

    // Create Payments table
    await queryInterface.createTable('Payments', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        invoiceId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Invoices',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        method: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'completed',
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

    // Create Expenses table
    await queryInterface.createTable('Expenses', {
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
            type: DataTypes.STRING,
            allowNull: true,
        },
        unitId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'USD',
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        isRecurring: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        recurrenceType: {
            type: DataTypes.STRING, // Using STRING for ENUM to be safe/simple in migration
            allowNull: true,
        },
        recurrenceInterval: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        recurrenceDayOfWeek: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        recurrenceDayOfMonth: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        recurrenceEndDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        recurrenceMaxOccurrences: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        nextOccurrence: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        occurrenceCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
    await queryInterface.addIndex('LedgerAccounts', ['tenantId', 'code'], { unique: true });
    await queryInterface.addIndex('LedgerEntries', ['tenantId']);
    await queryInterface.addIndex('LedgerEntries', ['accountId']);
    await queryInterface.addIndex('LedgerEntries', ['journalId']);
    await queryInterface.addIndex('Invoices', ['tenantId']);
    await queryInterface.addIndex('Invoices', ['leaseId']);
    await queryInterface.addIndex('Invoices', ['status']);
    await queryInterface.addIndex('Payments', ['tenantId']);
    await queryInterface.addIndex('Payments', ['invoiceId']);
    await queryInterface.addIndex('Expenses', ['tenantId']);
    await queryInterface.addIndex('Expenses', ['propertyId']);
    await queryInterface.addIndex('Expenses', ['isRecurring']);
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.dropTable('Expenses');
    await queryInterface.dropTable('Payments');
    await queryInterface.dropTable('Invoices');
    await queryInterface.dropTable('LedgerEntries');
    await queryInterface.dropTable('LedgerAccounts');
};
