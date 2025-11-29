import { Column, Model, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';
import { Role } from './role.model';

@Table
export class UserRole extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId!: string;

    @ForeignKey(() => Role)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    roleId!: string;
}
