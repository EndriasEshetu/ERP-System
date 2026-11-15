import { prisma } from '../../database/prisma.service.js';
import { CreateUomInput, UpdateUomInput, UnitOfMeasurementDto } from '@erp/shared';

export class UomService {
  async list(organizationId: string): Promise<UnitOfMeasurementDto[]> {
    return prisma.unitOfMeasurement.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async getById(organizationId: string, id: string): Promise<UnitOfMeasurementDto | null> {
    return prisma.unitOfMeasurement.findFirst({
      where: { id, organizationId },
    });
  }

  async create(organizationId: string, input: CreateUomInput): Promise<UnitOfMeasurementDto> {
    const existing = await prisma.unitOfMeasurement.findFirst({
      where: {
        organizationId,
        symbol: { equals: input.symbol, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new Error(`Unit of measurement with symbol "${input.symbol}" already exists`);
    }

    return prisma.unitOfMeasurement.create({
      data: {
        organizationId,
        name: input.name.trim(),
        symbol: input.symbol.trim().toLowerCase(),
        category: input.category?.trim() || null,
      },
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateUomInput
  ): Promise<UnitOfMeasurementDto> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Unit of measurement not found');
    }

    if (input.symbol && input.symbol.toLowerCase() !== existing.symbol.toLowerCase()) {
      const duplicate = await prisma.unitOfMeasurement.findFirst({
        where: {
          organizationId,
          symbol: { equals: input.symbol, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new Error(`Unit of measurement with symbol "${input.symbol}" already exists`);
      }
    }

    return prisma.unitOfMeasurement.update({
      where: { id },
      data: {
        name: input.name !== undefined ? input.name.trim() : undefined,
        symbol: input.symbol !== undefined ? input.symbol.trim().toLowerCase() : undefined,
        category: input.category !== undefined ? input.category.trim() || null : undefined,
      },
    });
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Unit of measurement not found');
    }

    // Check if products reference this UoM
    const productCount = await prisma.product.count({
      where: { organizationId, uomId: id },
    });

    if (productCount > 0) {
      throw new Error(`Cannot delete UoM: it is referenced by ${productCount} product(s)`);
    }

    await prisma.unitOfMeasurement.delete({
      where: { id },
    });
  }
}

export const uomService = new UomService();
