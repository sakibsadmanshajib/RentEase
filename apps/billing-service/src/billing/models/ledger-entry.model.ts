import { BeforeCreate, BeforeFind, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { OrganizationContext } from '@rentease/common';
import { LedgerAccount } from './ledger-account.model';

@Table({ tableName: 'LedgerEntries' })
export class LedgerEntry extends Model {
    @BeforeFind
    static enforceOrganizationIsolation(options: any) {
        const orgId = OrganizationContext.getOrgId();
        if (!orgId) {
             // throw new Error('Organization context missing for isolation');
        } else {
            options.where = { ...options.where, orgId };
        }
    }

    @BeforeCreate
    static setOrgId(instance: LedgerEntry) {
        const orgId = OrganizationContext.getOrgId();
        if (orgId) {
            instance.orgId = orgId;
        }
    }

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    orgId!: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    journalId!: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    accountId!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        defaultValue: 0,
    })
    debit!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        defaultValue: 0,
    })
    credit!: number;

    @Column({
        type: DataType.STRING,
        defaultValue: 'USD',
    })
    currency!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    correlationId?: string;
}
