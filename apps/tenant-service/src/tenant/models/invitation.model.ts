import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from './tenant.model';

@Table
export class Invitation extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @ForeignKey(() => Tenant)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    tenantId!: string;

    @BelongsTo(() => Tenant)
    tenant!: Tenant;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    roleId!: string; // ID of the Role in Identity Service

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    token!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    expiresAt!: Date;

    @Column({
        type: DataType.STRING,
        defaultValue: 'pending', // pending, accepted, expired
    })
    status!: string;
}
