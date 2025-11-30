import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class Invoice extends Model {
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
    tenantId!: string;

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
        type: DataType.JSON,
        allowNull: true,
    })
    lineItems?: any;
}
