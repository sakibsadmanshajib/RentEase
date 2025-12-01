import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Role } from './role.model';

@Table
export class UserTenantMembership extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId!: string;

    @BelongsTo(() => User)
    user!: User;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    tenantId!: string; // References Tenant in Tenant Service (soft link)

    @ForeignKey(() => Role)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    roleId!: string;

    @BelongsTo(() => Role)
    role!: Role;
}
