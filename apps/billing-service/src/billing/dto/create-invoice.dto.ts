export class CreateInvoiceDto {
    tenantId!: string;
    leaseId?: string;
    invoiceNumber?: string;
    issueDate?: Date;
    dueDate!: Date;
    periodStart?: Date;
    periodEnd?: Date;
    amount!: number;
    currency?: string;
    lineItems?: any;
}
