export class RecordPaymentDto {
    tenantId!: string;
    invoiceId!: string;
    amount!: number;
    method!: string;
    date?: Date;
}
