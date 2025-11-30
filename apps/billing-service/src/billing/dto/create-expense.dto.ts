export class CreateExpenseDto {
    tenantId!: string;
    propertyId?: string;
    unitId?: string;
    category!: string;
    description!: string;
    amount!: number;
    currency?: string;
    date?: Date;

    // Recurrence fields
    isRecurring?: boolean;
    recurrenceType?: string;
    recurrenceInterval?: number;
    recurrenceDayOfWeek?: number;
    recurrenceDayOfMonth?: number;
    recurrenceEndDate?: Date;
    recurrenceMaxOccurrences?: number;
}
