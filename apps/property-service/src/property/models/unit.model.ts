import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Property } from './property.model';

@Table({ tableName: 'Units' })
export class Unit extends Model {
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
    tenantId!: string;

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
