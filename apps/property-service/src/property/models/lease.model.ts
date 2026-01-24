import { BeforeValidate, Column, Model, Table, DataType } from 'sequelize-typescript';
import { OrganizationContext } from '@rentease/common';

@Table({ tableName: 'Leases' })
export class Lease extends Model {
    @BeforeValidate
    static setOrgId(instance: Lease) {
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
        type: DataType.UUID,
        allowNull: false,
    })
    propertyId!: string;

    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    unitId?: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    startDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    endDate!: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'monthlyRent',
    })
    rentAmount!: number;

    @Column({
        type: DataType.STRING,
        defaultValue: 'DRAFT',
    })
    status!: string;
}
