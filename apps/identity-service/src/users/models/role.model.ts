import { Column, Model, Table, DataType, BelongsToMany } from 'sequelize-typescript';
import { User } from './user.model';
import { UserRole } from './user-role.model';

@Table
export class Role extends Model {
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
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    description?: string;

    @BelongsToMany(() => User, () => UserRole)
    users!: User[];
}
