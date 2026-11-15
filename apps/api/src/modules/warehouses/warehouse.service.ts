import { prisma } from '../../database/prisma.service.js';
import { CreateWarehouseInput, UpdateWarehouseInput, WarehouseDto } from '@erp/shared';

export class WarehouseService {
  async list(organizationId: string): Promise<WarehouseDto[]> {
    return prisma.warehouse.findMany({
      where: { organizationId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async getById(organizationId: string, id: string): Promise<WarehouseDto | null> {
    return prisma.warehouse.findFirst({
      where: { id, organizationId },
    });
  }

  async create(organizationId: string, input: CreateWarehouseInput): Promise<WarehouseDto> {
    const existing = await prisma.warehouse.findFirst({
      where: {
        organizationId,
        code: { equals: input.code.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new Error(`Warehouse with code "${input.code}" already exists`);
    }

    // Non-functional ACID rule: If setting as default, unset existing default
    if (input.isDefault) {
      await prisma.warehouse.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.warehouse.create({
      data: {
        organizationId,
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        address: input.address?.trim() || null,
        isDefault: input.isDefault ?? false,
        isActive: input.isActive ?? true,
      },
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateWarehouseInput
  ): Promise<WarehouseDto> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Warehouse not found');
    }

    if (input.code && input.code.toUpperCase() !== existing.code.toUpperCase()) {
      const duplicate = await prisma.warehouse.findFirst({
        where: {
          organizationId,
          code: { equals: input.code.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new Error(`Warehouse with code "${input.code}" already exists`);
      }
    }

    if (input.isDefault) {
      await prisma.warehouse.updateMany({
        where: { organizationId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.warehouse.update({
      where: { id },
      data: {
        name: input.name !== undefined ? input.name.trim() : undefined,
        code: input.code !== undefined ? input.code.trim().toUpperCase() : undefined,
        address: input.address !== undefined ? input.address?.trim() || null : undefined,
        isDefault: input.isDefault !== undefined ? input.isDefault : undefined,
        isActive: input.isActive !== undefined ? input.isActive : undefined,
      },
    });
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Warehouse not found');
    }

    // Non-functional Data Integrity: Check if warehouse holds active stock
    const positiveStock = await prisma.stockLevel.findFirst({
      where: {
        warehouseId: id,
        organizationId,
        quantityOnHand: { gt: 0 },
      },
    });

    if (positiveStock) {
      throw new Error('Cannot delete warehouse that contains active stock inventory. Transfer or adjust stock first.');
    }

    await prisma.stockLevel.deleteMany({ where: { warehouseId: id } });
    await prisma.warehouse.delete({ where: { id } });
  }
}

export const warehouseService = new WarehouseService();
