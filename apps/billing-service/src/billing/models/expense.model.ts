import { BeforeCreate, BeforeFind, Column, DataType, Model, Table } from 'sequelize-typescript';
import { OrganizationContext } from '@rentease/common';

@Table({ tableName: 'Expenses' })
export class Expense extends Model {
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
    static setOrgId(instance: Expense) {
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
        type: DataType.STRING,
        allowNull: true,
    })
    propertyId?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    unitId?: string;

    @Column({
        type: DataType.ENUM('REPAIR', 'UTILITY', 'INSURANCE', 'FEE', 'TAX', 'MAINTENANCE', 'OTHER'),
        allowNull: false,
    })
    category!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    description!: string;

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
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    date!: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isRecurring!: boolean;

    @Column({
        type: DataType.ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'),
        allowNull: true,
    })
    recurrenceType?: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    recurrenceInterval?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        comment: '0-6 for Sunday-Saturday',
    })
    recurrenceDayOfWeek?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        comment: '1-31 for day of month',
    })
    recurrenceDayOfMonth?: number;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    recurrenceEndDate?: Date;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    recurrenceMaxOccurrences?: number;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    nextOccurrence?: Date;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    occurrenceCount!: number;
}
