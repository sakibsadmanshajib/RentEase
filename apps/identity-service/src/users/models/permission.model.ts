import { Column, Model, Table, DataType, BelongsToMany } from 'sequelize-typescript';
import { Role } from './role.model';
import { RolePermission } from './role-permission.model';

@Table
export class Permission extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    name!: string; // e.g., 'property:create'

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    description?: string;

    @BelongsToMany(() => Role, () => RolePermission)
    roles!: Role[];
}
