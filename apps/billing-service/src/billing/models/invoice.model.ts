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
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    amount!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    tenantId!: string; // Foreign key to Tenant

    @Column({
        type: DataType.STRING,
        defaultValue: 'PENDING',
    })
    status!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    dueDate!: Date;
}
