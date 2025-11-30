import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class LedgerEntry extends Model {
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
