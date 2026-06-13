// @ts-nocheck
import { DataTypes } from 'sequelize';

async function resolveOrgTable(queryInterface: import('sequelize').QueryInterface): Promise<string | null> {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Organizations')) {
        return 'Organizations';
    }
    if (tables.includes('Tenants')) {
        return 'Tenants';
    }
    return null;
}

export const up = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const orgTable = await resolveOrgTable(queryInterface);
    if (!orgTable) {
        return;
    }

    const description = await queryInterface.describeTable(orgTable);

    if ('address' in description && !('addressLine1' in description)) {
        await queryInterface.renameColumn(orgTable, 'address', 'addressLine1');
    }

    if ('zipCode' in description && !('zip' in description)) {
        await queryInterface.renameColumn(orgTable, 'zipCode', 'zip');
    }

    if (!('slug' in description)) {
        await queryInterface.addColumn(orgTable, 'slug', {
            type: DataTypes.STRING,
            allowNull: true,
        });
        await sequelize.query(
            `UPDATE "${orgTable}" SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8) WHERE slug IS NULL`,
        );
        await queryInterface.changeColumn(orgTable, 'slug', {
            type: DataTypes.STRING,
            allowNull: false,
        });
        await queryInterface.addIndex(orgTable, ['slug'], { unique: true });
    }

    if (!('region' in description)) {
        await queryInterface.addColumn(orgTable, 'region', {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'US',
        });
    }

    if (!('settings' in description)) {
        await queryInterface.addColumn(orgTable, 'settings', {
            type: DataTypes.JSONB,
            allowNull: true,
        });
    }

    if (!('subscriptionStatus' in description)) {
        await queryInterface.addColumn(orgTable, 'subscriptionStatus', {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'active',
        });
    }

    const invitationDescription = await queryInterface.describeTable('Invitations');
    if ('orgId' in invitationDescription && !('tenantId' in invitationDescription)) {
        await queryInterface.renameColumn('Invitations', 'orgId', 'tenantId');
    }
};

export const down = async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const orgTable = await resolveOrgTable(queryInterface);
    if (!orgTable) {
        return;
    }

    const description = await queryInterface.describeTable(orgTable);

    if ('subscriptionStatus' in description) {
        await queryInterface.removeColumn(orgTable, 'subscriptionStatus');
    }
    if ('settings' in description) {
        await queryInterface.removeColumn(orgTable, 'settings');
    }
    if ('region' in description) {
        await queryInterface.removeColumn(orgTable, 'region');
    }
    if ('slug' in description) {
        await queryInterface.removeColumn(orgTable, 'slug');
    }
    if ('zip' in description && !('zipCode' in description)) {
        await queryInterface.renameColumn(orgTable, 'zip', 'zipCode');
    }
    if ('addressLine1' in description && !('address' in description)) {
        await queryInterface.renameColumn(orgTable, 'addressLine1', 'address');
    }
};
