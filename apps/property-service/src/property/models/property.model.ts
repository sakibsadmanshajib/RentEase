import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class Property extends Model {
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
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    address!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    tenantId!: string; // Foreign key to Tenant (logical link)
}
