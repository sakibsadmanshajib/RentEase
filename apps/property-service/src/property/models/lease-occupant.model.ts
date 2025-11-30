import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Lease } from './lease.model';

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
