export class CreateLeaseDto {
    startDate!: Date;
    endDate!: Date;
    rentAmount!: number;
    propertyId!: string;
    tenantId!: string;
}
