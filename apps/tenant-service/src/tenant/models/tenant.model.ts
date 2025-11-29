import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class Tenant extends Model {
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
    contactEmail?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    contactPhone?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    addressLine1?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    city?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    state?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    zip?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    country?: string;

    @Column({
        type: DataType.STRING,
        defaultValue: 'US',
    })
    region?: string;
}
