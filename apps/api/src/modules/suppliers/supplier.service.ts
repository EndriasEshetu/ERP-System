import { prisma } from '../../database/prisma.service.js';
import { CreateSupplierInput, UpdateSupplierInput, SupplierDto } from '@erp/shared';

export class SupplierService {
  async list(organizationId: string): Promise<SupplierDto[]> {
    return prisma.supplier.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async getById(organizationId: string, id: string): Promise<SupplierDto | null> {
    return prisma.supplier.findFirst({
      where: { id, organizationId },
    });
  }

  async create(organizationId: string, input: CreateSupplierInput): Promise<SupplierDto> {
    const existing = await prisma.supplier.findFirst({
      where: {
        organizationId,
        code: { equals: input.code.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new Error(`Supplier with code "${input.code}" already exists`);
    }

    return prisma.supplier.create({
      data: {
        organizationId,
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        address: input.address?.trim() || null,
        taxId: input.taxId?.trim() || null,
        paymentTerms: input.paymentTerms?.trim() || 'Net 30',
        isActive: input.isActive ?? true,
      },
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateSupplierInput
  ): Promise<SupplierDto> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Supplier not found');
    }

    if (input.code && input.code.toUpperCase() !== existing.code.toUpperCase()) {
      const duplicate = await prisma.supplier.findFirst({
        where: {
          organizationId,
          code: { equals: input.code.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new Error(`Supplier with code "${input.code}" already exists`);
      }
    }

    return prisma.supplier.update({
      where: { id },
      data: {
        name: input.name !== undefined ? input.name.trim() : undefined,
        code: input.code !== undefined ? input.code.trim().toUpperCase() : undefined,
        email: input.email !== undefined ? input.email?.trim() || null : undefined,
        phone: input.phone !== undefined ? input.phone?.trim() || null : undefined,
        address: input.address !== undefined ? input.address?.trim() || null : undefined,
        taxId: input.taxId !== undefined ? input.taxId?.trim() || null : undefined,
        paymentTerms: input.paymentTerms !== undefined ? input.paymentTerms?.trim() || null : undefined,
        isActive: input.isActive !== undefined ? input.isActive : undefined,
      },
    });
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Supplier not found');
    }

    const poCount = await prisma.purchaseOrder.count({
      where: { supplierId: id },
    });

    if (poCount > 0) {
      // Soft-delete to preserve procurement audit records
      await prisma.supplier.update({
        where: { id },
        data: { isActive: false },
      });
      return;
    }

    await prisma.supplier.delete({ where: { id } });
  }
}

export const supplierService = new SupplierService();
