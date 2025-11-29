import { Column, Model, Table, DataType, BelongsToMany } from 'sequelize-typescript';
import { Role } from './role.model';
import { UserRole } from './user-role.model';

@Table
export class User extends Model {
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
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    password?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    firstName?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    lastName?: string;

    @BelongsToMany(() => Role, () => UserRole)
    roles!: Role[];
}
