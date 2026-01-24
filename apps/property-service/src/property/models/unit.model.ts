import { BeforeValidate, Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { OrganizationContext } from '@rentease/common';
import { Property } from './property.model';

@Table({ tableName: 'Units' })
export class Unit extends Model {
    @BeforeValidate
    static setOrgId(instance: Unit) {
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

    @ForeignKey(() => Property)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    propertyId!: string;

    @BelongsTo(() => Property)
    property!: Property;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    unitNumber!: string;

    @Column({
        type: DataType.STRING,
        defaultValue: 'available', // Migration says 'available', model said 'VACANT'. Migration wins.
    })
    status!: string;
}
