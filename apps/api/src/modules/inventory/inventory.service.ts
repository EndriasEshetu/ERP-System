import { prisma } from '../../database/prisma.service.js';
import {
  StockLevelDto,
  StockMovementDto,
  CreateStockMovementInput,
  StockAdjustmentInput,
  StockCheckRequest,
  StockCheckResult,
  ProductType,
} from '@erp/shared';
import { Decimal } from '@prisma/client/runtime/library';

export class InventoryService {
  async getStockLevels(
    organizationId: string,
    warehouseId?: string,
    productId?: string
  ): Promise<StockLevelDto[]> {
    const where: any = { organizationId };
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;

    const levels = await prisma.stockLevel.findMany({
      where,
      include: {
        product: {
          include: { uom: true, category: true },
        },
        warehouse: true,
      },
      orderBy: { product: { name: 'asc' } },
    });

    return levels.map((sl) => {
      const onHand = Number(sl.quantityOnHand);
      const reserved = Number(sl.reservedQty);
      return {
        id: sl.id,
        organizationId: sl.organizationId,
        productId: sl.productId,
        warehouseId: sl.warehouseId,
        quantityOnHand: onHand,
        reservedQty: reserved,
        availableQty: Math.max(0, onHand - reserved),
        product: {
          id: sl.product.id,
          organizationId: sl.product.organizationId,
          sku: sl.product.sku,
          name: sl.product.name,
          type: sl.product.type as ProductType,
          costPrice: Number(sl.product.costPrice),
          salePrice: Number(sl.product.salePrice),
          reorderPoint: sl.product.reorderPoint,
          isActive: sl.product.isActive,
          uomId: sl.product.uomId,
          uom: sl.product.uom,
          createdAt: sl.product.createdAt,
          updatedAt: sl.product.updatedAt,
        },
        warehouse: sl.warehouse,
        createdAt: sl.updatedAt,
        updatedAt: sl.updatedAt,
      };
    });
  }

  async getStockMovements(
    organizationId: string,
    productId?: string,
    warehouseId?: string,
    limit: number = 50
  ): Promise<StockMovementDto[]> {
    const where: any = { organizationId };
    if (productId) where.productId = productId;
    if (warehouseId) {
      where.OR = [
        { sourceWarehouseId: warehouseId },
        { destWarehouseId: warehouseId },
      ];
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      take: Math.min(100, Math.max(1, limit)),
      include: {
        product: true,
        sourceWarehouse: true,
        destWarehouse: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return movements.map((m) => ({
      id: m.id,
      organizationId: m.organizationId,
      productId: m.productId,
      sourceWarehouseId: m.sourceWarehouseId,
      destWarehouseId: m.destWarehouseId,
      quantity: Number(m.quantity),
      type: m.type,
      referenceNumber: m.referenceNumber,
      notes: m.notes,
      createdBy: m.createdBy,
      createdAt: m.createdAt,
      updatedAt: m.createdAt,
      product: {
        id: m.product.id,
        organizationId: m.product.organizationId,
        sku: m.product.sku,
        name: m.product.name,
        type: m.product.type as ProductType,
        uomId: m.product.uomId,
        costPrice: Number(m.product.costPrice),
        salePrice: Number(m.product.salePrice),
        reorderPoint: m.product.reorderPoint,
        isActive: m.product.isActive,
        createdAt: m.product.createdAt,
        updatedAt: m.product.updatedAt,
      },
      sourceWarehouse: m.sourceWarehouse,
      destWarehouse: m.destWarehouse,
    }));
  }

  /**
   * Non-Functional ACID Guarantee:
   * Executes stock ledger record and balance mutation inside a single atomic transaction.
   */
  async recordMovement(
    organizationId: string,
    userId: string,
    input: CreateStockMovementInput
  ): Promise<StockMovementDto> {
    const qty = new Decimal(input.quantity);
    if (qty.lte(0)) {
      throw new Error('Movement quantity must be greater than zero');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Validate Product exists in Tenant
      const product = await tx.product.findFirst({
        where: { id: input.productId, organizationId },
      });
      if (!product) {
        throw new Error('Product not found in this organization');
      }

      // 2. Validate Warehouses
      if (input.sourceWarehouseId) {
        const src = await tx.warehouse.findFirst({
          where: { id: input.sourceWarehouseId, organizationId },
        });
        if (!src) throw new Error('Source warehouse not found');
      }

      if (input.destWarehouseId) {
        const dest = await tx.warehouse.findFirst({
          where: { id: input.destWarehouseId, organizationId },
        });
        if (!dest) throw new Error('Destination warehouse not found');
      }

      // 3. Process Balance Changes based on Movement Type
      if (input.type === 'RECEIPT' || input.type === 'ADJUSTMENT_IN') {
        if (!input.destWarehouseId) {
          throw new Error('Destination warehouse required for inbound movement');
        }

        // Upsert stock level
        const current = await tx.stockLevel.findUnique({
          where: {
            organizationId_productId_warehouseId: {
              organizationId,
              productId: input.productId,
              warehouseId: input.destWarehouseId,
            },
          },
        });

        if (current) {
          await tx.stockLevel.update({
            where: { id: current.id },
            data: { quantityOnHand: { increment: qty } },
          });
        } else {
          await tx.stockLevel.create({
            data: {
              organizationId,
              productId: input.productId,
              warehouseId: input.destWarehouseId,
              quantityOnHand: qty,
              reservedQty: new Decimal(0),
            },
          });
        }
      } else if (input.type === 'DELIVERY' || input.type === 'ADJUSTMENT_OUT') {
        if (!input.sourceWarehouseId) {
          throw new Error('Source warehouse required for outbound movement');
        }

        const current = await tx.stockLevel.findUnique({
          where: {
            organizationId_productId_warehouseId: {
              organizationId,
              productId: input.productId,
              warehouseId: input.sourceWarehouseId,
            },
          },
        });

        if (!current || Number(current.quantityOnHand) < Number(qty)) {
          throw new Error(
            `Insufficient stock in source warehouse. Available: ${current ? current.quantityOnHand : 0}, requested: ${qty}`
          );
        }

        await tx.stockLevel.update({
          where: { id: current.id },
          data: { quantityOnHand: { decrement: qty } },
        });
      } else if (input.type === 'INTERNAL') {
        if (!input.sourceWarehouseId || !input.destWarehouseId) {
          throw new Error('Both source and destination warehouses required for internal transfer');
        }
        if (input.sourceWarehouseId === input.destWarehouseId) {
          throw new Error('Source and destination warehouses cannot be the same');
        }

        // Check source stock
        const srcLevel = await tx.stockLevel.findUnique({
          where: {
            organizationId_productId_warehouseId: {
              organizationId,
              productId: input.productId,
              warehouseId: input.sourceWarehouseId,
            },
          },
        });

        if (!srcLevel || Number(srcLevel.quantityOnHand) < Number(qty)) {
          throw new Error(
            `Insufficient stock to transfer. Available: ${srcLevel ? srcLevel.quantityOnHand : 0}`
          );
        }

        // Decrement source
        await tx.stockLevel.update({
          where: { id: srcLevel.id },
          data: { quantityOnHand: { decrement: qty } },
        });

        // Increment dest
        const destLevel = await tx.stockLevel.findUnique({
          where: {
            organizationId_productId_warehouseId: {
              organizationId,
              productId: input.productId,
              warehouseId: input.destWarehouseId,
            },
          },
        });

        if (destLevel) {
          await tx.stockLevel.update({
            where: { id: destLevel.id },
            data: { quantityOnHand: { increment: qty } },
          });
        } else {
          await tx.stockLevel.create({
            data: {
              organizationId,
              productId: input.productId,
              warehouseId: input.destWarehouseId,
              quantityOnHand: qty,
              reservedQty: new Decimal(0),
            },
          });
        }
      }

      // 4. Create immutable Movement Ledger entry
      const movement = await tx.stockMovement.create({
        data: {
          organizationId,
          productId: input.productId,
          sourceWarehouseId: input.sourceWarehouseId || null,
          destWarehouseId: input.destWarehouseId || null,
          quantity: qty,
          type: input.type,
          referenceNumber: input.referenceNumber?.trim() || null,
          notes: input.notes?.trim() || null,
          createdBy: userId,
        },
        include: {
          product: true,
          sourceWarehouse: true,
          destWarehouse: true,
        },
      });

      return {
        id: movement.id,
        organizationId: movement.organizationId,
        productId: movement.productId,
        sourceWarehouseId: movement.sourceWarehouseId,
        destWarehouseId: movement.destWarehouseId,
        quantity: Number(movement.quantity),
        type: movement.type,
        referenceNumber: movement.referenceNumber,
        notes: movement.notes,
        createdBy: movement.createdBy,
        createdAt: movement.createdAt,
        updatedAt: movement.createdAt,
        product: {
          id: movement.product.id,
          organizationId: movement.product.organizationId,
          sku: movement.product.sku,
          name: movement.product.name,
          type: movement.product.type as ProductType,
          uomId: movement.product.uomId,
          costPrice: Number(movement.product.costPrice),
          salePrice: Number(movement.product.salePrice),
          reorderPoint: movement.product.reorderPoint,
          isActive: movement.product.isActive,
          createdAt: movement.product.createdAt,
          updatedAt: movement.product.updatedAt,
        },
        sourceWarehouse: movement.sourceWarehouse,
        destWarehouse: movement.destWarehouse,
      };
    });
  }

  /**
   * Adjust Stock after physical inventory count
   */
  async adjustStock(
    organizationId: string,
    userId: string,
    input: StockAdjustmentInput
  ): Promise<StockMovementDto> {
    const current = await prisma.stockLevel.findUnique({
      where: {
        organizationId_productId_warehouseId: {
          organizationId,
          productId: input.productId,
          warehouseId: input.warehouseId,
        },
      },
    });

    const currentQty = current ? Number(current.quantityOnHand) : 0;
    const diff = input.actualQuantity - currentQty;

    if (diff === 0) {
      throw new Error('Actual quantity equals current system quantity. No adjustment needed.');
    }

    if (diff > 0) {
      return this.recordMovement(organizationId, userId, {
        productId: input.productId,
        destWarehouseId: input.warehouseId,
        quantity: diff,
        type: 'ADJUSTMENT_IN',
        referenceNumber: 'PHYSICAL-COUNT',
        notes: input.reason || 'Inventory audit surplus',
      });
    } else {
      return this.recordMovement(organizationId, userId, {
        productId: input.productId,
        sourceWarehouseId: input.warehouseId,
        quantity: Math.abs(diff),
        type: 'ADJUSTMENT_OUT',
        referenceNumber: 'PHYSICAL-COUNT',
        notes: input.reason || 'Inventory audit shrinkage/damage',
      });
    }
  }

  /**
   * Availability check contract for Developer A (Sales Module)
   */
  async checkAvailability(
    organizationId: string,
    request: StockCheckRequest
  ): Promise<StockCheckResult> {
    const where: any = {
      organizationId,
      productId: request.productId,
    };
    if (request.warehouseId) {
      where.warehouseId = request.warehouseId;
    }

    const levels = await prisma.stockLevel.findMany({ where });
    const onHand = levels.reduce((sum, sl) => sum + Number(sl.quantityOnHand), 0);
    const reserved = levels.reduce((sum, sl) => sum + Number(sl.reservedQty), 0);
    const available = Math.max(0, onHand - reserved);

    return {
      productId: request.productId,
      isAvailable: available >= request.requiredQty,
      quantityOnHand: onHand,
      reservedQty: reserved,
      availableQty: available,
    };
  }
}

export const inventoryService = new InventoryService();
