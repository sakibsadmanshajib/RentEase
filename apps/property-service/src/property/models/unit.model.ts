import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Property } from './property.model';

@Table({ tableName: 'Units_v2' })
export class Unit extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

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
    name!: string;

    @Column({
        type: DataType.STRING,
        defaultValue: 'VACANT', // VACANT, OCCUPIED, MAINTENANCE
    })
    status!: string;

    // @HasMany(() => Lease)
    // leases!: any[];
}
