import { Column, Model, Table, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

@Table
export class Property extends Model {
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
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    address!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    tenantId!: string; // Foreign key to Tenant (logical link)
}

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

console.log('Unit class defined:', Unit);

@Table({ tableName: 'Leases_v2' })
export class Lease extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    // @ForeignKey(() => Unit)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    unitId!: string;

    // @BelongsTo(() => Unit)
    // unit!: Unit;

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

    @Column({
        type: DataType.STRING,
        defaultValue: 'DRAFT', // DRAFT, ACTIVE, EXPIRED, TERMINATED
    })
    status!: string;

    // @HasMany(() => LeaseOccupant)
    // occupants!: LeaseOccupant[];
}

@Table({ tableName: 'LeaseOccupants_v2' })
export class LeaseOccupant extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @ForeignKey(() => Lease)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    leaseId!: string;

    @BelongsTo(() => Lease)
    lease!: Lease;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId!: string; // Reference to Identity Service User
}
