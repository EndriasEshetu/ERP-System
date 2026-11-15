import { prisma } from '../../database/prisma.service.js';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterParams,
  ProductDto,
  PaginatedData,
  ProductType,
} from '@erp/shared';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductService {
  async list(
    organizationId: string,
    params: ProductFilterParams = {}
  ): Promise<PaginatedData<ProductDto>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
        { barcode: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          uom: true,
          stockLevels: true,
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    const formatted: ProductDto[] = items.map((p) => {
      const totalOnHand = p.stockLevels.reduce(
        (sum, sl) => sum + Number(sl.quantityOnHand),
        0
      );

      return {
        id: p.id,
        organizationId: p.organizationId,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        description: p.description,
        type: p.type as ProductType,
        categoryId: p.categoryId,
        category: p.category
          ? {
              id: p.category.id,
              organizationId: p.category.organizationId,
              name: p.category.name,
              code: p.category.code,
              parentId: p.category.parentId,
              createdAt: p.category.createdAt,
              updatedAt: p.category.updatedAt,
            }
          : null,
        uomId: p.uomId,
        uom: p.uom
          ? {
              id: p.uom.id,
              organizationId: p.uom.organizationId,
              name: p.uom.name,
              symbol: p.uom.symbol,
              category: p.uom.category,
              createdAt: p.uom.createdAt,
              updatedAt: p.uom.updatedAt,
            }
          : null,
        costPrice: Number(p.costPrice),
        salePrice: Number(p.salePrice),
        reorderPoint: p.reorderPoint,
        isActive: p.isActive,
        totalQuantityOnHand: totalOnHand,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return {
      items: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(organizationId: string, id: string): Promise<ProductDto | null> {
    const p = await prisma.product.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        uom: true,
        stockLevels: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!p) return null;

    const totalOnHand = p.stockLevels.reduce(
      (sum, sl) => sum + Number(sl.quantityOnHand),
      0
    );

    return {
      id: p.id,
      organizationId: p.organizationId,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      description: p.description,
      type: p.type as ProductType,
      categoryId: p.categoryId,
      category: p.category
        ? {
            id: p.category.id,
            organizationId: p.category.organizationId,
            name: p.category.name,
            code: p.category.code,
            parentId: p.category.parentId,
            createdAt: p.category.createdAt,
            updatedAt: p.category.updatedAt,
          }
        : null,
      uomId: p.uomId,
      uom: p.uom
        ? {
            id: p.uom.id,
            organizationId: p.uom.organizationId,
            name: p.uom.name,
            symbol: p.uom.symbol,
            category: p.uom.category,
            createdAt: p.uom.createdAt,
            updatedAt: p.uom.updatedAt,
          }
        : null,
      costPrice: Number(p.costPrice),
      salePrice: Number(p.salePrice),
      reorderPoint: p.reorderPoint,
      isActive: p.isActive,
      totalQuantityOnHand: totalOnHand,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async create(organizationId: string, input: CreateProductInput): Promise<ProductDto> {
    // Validate SKU uniqueness within organization
    const existing = await prisma.product.findFirst({
      where: {
        organizationId,
        sku: { equals: input.sku.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new Error(`Product with SKU "${input.sku}" already exists`);
    }

    // Validate UoM exists in tenant
    const uom = await prisma.unitOfMeasurement.findFirst({
      where: { id: input.uomId, organizationId },
    });
    if (!uom) {
      throw new Error('Specified Unit of Measurement was not found');
    }

    // Validate Category if provided
    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, organizationId },
      });
      if (!category) {
        throw new Error('Specified Category was not found');
      }
    }

    const created = await prisma.product.create({
      data: {
        organizationId,
        sku: input.sku.trim().toUpperCase(),
        barcode: input.barcode?.trim() || null,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        type: input.type || 'STORABLE',
        categoryId: input.categoryId || null,
        uomId: input.uomId,
        costPrice: new Decimal(input.costPrice ?? 0),
        salePrice: new Decimal(input.salePrice ?? 0),
        reorderPoint: input.reorderPoint ?? 10,
        isActive: input.isActive ?? true,
      },
      include: {
        category: true,
        uom: true,
      },
    });

    return {
      id: created.id,
      organizationId: created.organizationId,
      sku: created.sku,
      barcode: created.barcode,
      name: created.name,
      description: created.description,
      type: created.type as ProductType,
      categoryId: created.categoryId,
      category: created.category
        ? {
            id: created.category.id,
            organizationId: created.category.organizationId,
            name: created.category.name,
            code: created.category.code,
            parentId: created.category.parentId,
            createdAt: created.category.createdAt,
            updatedAt: created.category.updatedAt,
          }
        : null,
      uomId: created.uomId,
      uom: {
        id: created.uom.id,
        organizationId: created.uom.organizationId,
        name: created.uom.name,
        symbol: created.uom.symbol,
        category: created.uom.category,
        createdAt: created.uom.createdAt,
        updatedAt: created.uom.updatedAt,
      },
      costPrice: Number(created.costPrice),
      salePrice: Number(created.salePrice),
      reorderPoint: created.reorderPoint,
      isActive: created.isActive,
      totalQuantityOnHand: 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateProductInput
  ): Promise<ProductDto> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Product not found');
    }

    if (input.sku && input.sku.toUpperCase() !== existing.sku.toUpperCase()) {
      const duplicate = await prisma.product.findFirst({
        where: {
          organizationId,
          sku: { equals: input.sku.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new Error(`Product with SKU "${input.sku}" already exists`);
      }
    }

    if (input.uomId) {
      const uom = await prisma.unitOfMeasurement.findFirst({
        where: { id: input.uomId, organizationId },
      });
      if (!uom) {
        throw new Error('Specified Unit of Measurement was not found');
      }
    }

    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, organizationId },
      });
      if (!category) {
        throw new Error('Specified Category was not found');
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        sku: input.sku ? input.sku.trim().toUpperCase() : undefined,
        barcode: input.barcode !== undefined ? input.barcode?.trim() || null : undefined,
        name: input.name ? input.name.trim() : undefined,
        description: input.description !== undefined ? input.description?.trim() || null : undefined,
        type: input.type !== undefined ? input.type : undefined,
        categoryId: input.categoryId !== undefined ? input.categoryId : undefined,
        uomId: input.uomId !== undefined ? input.uomId : undefined,
        costPrice: input.costPrice !== undefined ? new Decimal(input.costPrice) : undefined,
        salePrice: input.salePrice !== undefined ? new Decimal(input.salePrice) : undefined,
        reorderPoint: input.reorderPoint !== undefined ? input.reorderPoint : undefined,
        isActive: input.isActive !== undefined ? input.isActive : undefined,
      },
      include: {
        category: true,
        uom: true,
      },
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      sku: updated.sku,
      barcode: updated.barcode,
      name: updated.name,
      description: updated.description,
      type: updated.type as ProductType,
      categoryId: updated.categoryId,
      category: updated.category
        ? {
            id: updated.category.id,
            organizationId: updated.category.organizationId,
            name: updated.category.name,
            code: updated.category.code,
            parentId: updated.category.parentId,
            createdAt: updated.category.createdAt,
            updatedAt: updated.category.updatedAt,
          }
        : null,
      uomId: updated.uomId,
      uom: {
        id: updated.uom.id,
        organizationId: updated.uom.organizationId,
        name: updated.uom.name,
        symbol: updated.uom.symbol,
        category: updated.uom.category,
        createdAt: updated.uom.createdAt,
        updatedAt: updated.uom.updatedAt,
      },
      costPrice: Number(updated.costPrice),
      salePrice: Number(updated.salePrice),
      reorderPoint: updated.reorderPoint,
      isActive: updated.isActive,
      totalQuantityOnHand: existing.totalQuantityOnHand,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Product not found');
    }

    // Check if product has historical transactions
    const [movementCount, poItemCount] = await Promise.all([
      prisma.stockMovement.count({ where: { organizationId, productId: id } }),
      prisma.purchaseOrderItem.count({ where: { productId: id } }),
    ]);

    if (movementCount > 0 || poItemCount > 0) {
      // Soft-delete to preserve audit logs
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return;
    }

    await prisma.stockLevel.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  }
}

export const productService = new ProductService();
