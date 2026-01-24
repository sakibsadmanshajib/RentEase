import { BeforeCreate, BeforeFind, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { OrganizationContext } from '@rentease/common';
import { Invoice } from './invoice.model';

@Table({ tableName: 'Payments' })
export class Payment extends Model {
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
    static setOrgId(instance: Payment) {
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
    invoiceId!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    amount!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    method!: string;

    @Column({
        type: DataType.STRING,
        defaultValue: 'COMPLETED',
    })
    status!: string;

    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW,
    })
    date!: Date;
}
