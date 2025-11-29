import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Property } from './property.model';

@Table
export class Lease extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

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
    })
    rentAmount!: number;

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
    tenantId!: string; // Foreign key to Tenant Service (logical link)

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isActive!: boolean;
}
