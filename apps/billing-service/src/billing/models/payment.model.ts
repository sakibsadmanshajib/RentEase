import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class Payment extends Model {
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
