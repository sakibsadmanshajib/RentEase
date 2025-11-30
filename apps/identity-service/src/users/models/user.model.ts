import { Column, Model, Table, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Role } from './role.model';
import { UserRole } from './user-role.model';
import { UserTenantMembership } from './user-tenant-membership.model';
import { EncryptionService } from '../../common/encryption.service';

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

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    get phone(): string {
        return EncryptionService.decrypt(this.getDataValue('phone'));
    }
    set phone(value: string) {
        this.setDataValue('phone', EncryptionService.encrypt(value));
    }

    @BelongsToMany(() => Role, () => UserRole)
    roles!: Role[];

    @HasMany(() => UserTenantMembership)
    tenantMemberships!: UserTenantMembership[];
}
