import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Invoice } from './models/invoice.model';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class BillingService {
    constructor(
        @InjectModel(Invoice)
        private invoiceModel: typeof Invoice,
    ) { }

    async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
        return this.invoiceModel.create(createInvoiceDto as any);
    }

    async findAll(): Promise<Invoice[]> {
        return this.invoiceModel.findAll();
    }

    async findOne(id: string): Promise<Invoice | null> {
        return this.invoiceModel.findByPk(id);
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<[number, Invoice[]]> {
        return this.invoiceModel.update(updateInvoiceDto, {
            where: { id },
            returning: true,
        });
    }

    async remove(id: string): Promise<void> {
        const invoice = await this.findOne(id);
        if (invoice) {
            await invoice.destroy();
        }
    }
}
