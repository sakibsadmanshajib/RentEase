import { BeforeCreate, BeforeFind, Column, DataType, Model, Table } from 'sequelize-typescript';
import { OrganizationContext } from '@rentease/common';

@Table({ tableName: 'Organizations' })
export class Tenant extends Model {
    // Organizations are flat, no parentId logic needed for now.
    // If we want isolation (e.g. System Admin vs Org Admin), we might check Context.
    // But usually 'Organizations' list is public or protected by SuperAdmin role.
    
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
    contactEmail?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    contactPhone?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    addressLine1?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    city?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    state?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    zip?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    country?: string;

    @Column({
        type: DataType.STRING,
        defaultValue: 'US',
    })
    region?: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    slug!: string;

    @Column({
        type: DataType.JSONB,
        allowNull: true,
    })
    settings?: any;

    @Column({
        type: DataType.STRING,
        defaultValue: 'active', // active, suspended, trial
    })
    subscriptionStatus?: string;
}
