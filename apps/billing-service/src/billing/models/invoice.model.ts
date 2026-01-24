import { BeforeCreate, BeforeFind, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { OrganizationContext } from '@rentease/common';
import { Payment } from './payment.model';

@Table({ tableName: 'Invoices' })
export class Invoice extends Model {
    @BeforeFind
    static enforceOrganizationIsolation(options: any) {
        const orgId = OrganizationContext.getOrgId();
        if (!orgId) {
            throw new Error('Organization context missing for isolation');
        }
        options.where = { ...(options.where ?? {}), orgId };
    }

    @BeforeCreate
    static setOrgId(instance: Invoice) {
        const orgId = OrganizationContext.getOrgId();
        if (!orgId) {
            throw new Error('Organization context required to create invoice');
        }
        instance.orgId = orgId;
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
        type: DataType.STRING,
        allowNull: true,
    })
    leaseId?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    invoiceNumber?: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    issueDate?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    dueDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    periodStart?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    periodEnd?: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    amount!: number;

    @Column({
        type: DataType.STRING,
        defaultValue: 'USD',
    })
    currency!: string;

    @Column({
        type: DataType.STRING,
        defaultValue: 'PENDING',
    })
    status!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    description?: string;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    lineItems?: any;
}
