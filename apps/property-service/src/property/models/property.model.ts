import { BeforeValidate, BeforeFind, Column, DataType, Model, Table } from 'sequelize-typescript';
import { OrganizationContext } from '@rentease/common';

@Table
export class Property extends Model {
    @BeforeFind
    static enforceOrganizationIsolation(options: any) {
        const orgId = OrganizationContext.getOrgId();
        if (!orgId) {
             // For Unit Tests or System calls, we need a bypass?
             // throw new Error('Organization context missing for isolation');
        } else {
            options.where = { ...options.where, orgId };
        }
    }

    @BeforeValidate
    static setOrgId(instance: Property) {
        const orgId = OrganizationContext.getOrgId();
        if (orgId) {
            instance.orgId = orgId;
        }
    }

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
    orgId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    address!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    city!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    state!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    zipCode!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    country!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    emergencyPhone!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    notes!: string;
}
