import { Column, Model, Table, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Role } from './role.model';
import { UserRole } from './user-role.model';
import { UserOrganizationMembership } from './user-tenant-membership.model';
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
    get firstName(): string | undefined {
        const value = this.getDataValue('firstName');
        return value ? EncryptionService.decrypt(value) : undefined;
    }
    set firstName(value: string | undefined) {
        if (value) {
            this.setDataValue('firstName', EncryptionService.encrypt(value));
        } else {
            this.setDataValue('firstName', value);
        }
    }

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    get lastName(): string | undefined {
        const value = this.getDataValue('lastName');
        return value ? EncryptionService.decrypt(value) : undefined;
    }
    set lastName(value: string | undefined) {
        if (value) {
            this.setDataValue('lastName', EncryptionService.encrypt(value));
        } else {
            this.setDataValue('lastName', value);
        }
    }

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

    @HasMany(() => UserOrganizationMembership)
    organizationMemberships!: UserOrganizationMembership[];
}
