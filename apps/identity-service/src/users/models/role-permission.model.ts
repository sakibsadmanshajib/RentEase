import { Column, Model, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { Role } from './role.model';
import { Permission } from './permission.model';

@Table
export class RolePermission extends Model {
    @ForeignKey(() => Role)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    roleId!: string;

    @ForeignKey(() => Permission)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    permissionId!: string;
}
