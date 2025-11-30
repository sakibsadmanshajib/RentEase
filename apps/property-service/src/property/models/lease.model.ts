import { Column, Model, Table, DataType } from 'sequelize-typescript';

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
