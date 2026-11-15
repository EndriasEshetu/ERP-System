import { prisma } from '../../database/prisma.service.js';
import {
  CreatePurchaseOrderInput,
  PurchaseOrderDto,
  PurchaseOrderStatus,
  CreateGoodsReceiptInput,
  GoodsReceiptDto,
  ProductType,
} from '@erp/shared';
import { Decimal } from '@prisma/client/runtime/library';

export class PurchaseService {
  async list(organizationId: string, status?: PurchaseOrderStatus): Promise<PurchaseOrderDto[]> {
    const where: any = { organizationId };
    if (status) where.status = status;

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      id: o.id,
      organizationId: o.organizationId,
      orderNumber: o.orderNumber,
      supplierId: o.supplierId,
      supplier: o.supplier,
      status: o.status,
      orderDate: o.orderDate,
      expectedDate: o.expectedDate,
      totalAmount: Number(o.totalAmount),
      notes: o.notes,
      createdBy: o.createdBy,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: o.items.map((it) => ({
        id: it.id,
        purchaseOrderId: it.purchaseOrderId,
        productId: it.productId,
        product: {
          id: it.product.id,
          organizationId: it.product.organizationId,
          sku: it.product.sku,
          name: it.product.name,
          type: it.product.type as ProductType,
          uomId: it.product.uomId,
          costPrice: Number(it.product.costPrice),
          salePrice: Number(it.product.salePrice),
          reorderPoint: it.product.reorderPoint,
          isActive: it.product.isActive,
          createdAt: it.product.createdAt,
          updatedAt: it.product.updatedAt,
        },
        orderedQty: Number(it.orderedQty),
        receivedQty: Number(it.receivedQty),
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
      })),
    }));
  }

  async getById(organizationId: string, id: string): Promise<PurchaseOrderDto | null> {
    const o = await prisma.purchaseOrder.findFirst({
      where: { id, organizationId },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!o) return null;

    return {
      id: o.id,
      organizationId: o.organizationId,
      orderNumber: o.orderNumber,
      supplierId: o.supplierId,
      supplier: o.supplier,
      status: o.status,
      orderDate: o.orderDate,
      expectedDate: o.expectedDate,
      totalAmount: Number(o.totalAmount),
      notes: o.notes,
      createdBy: o.createdBy,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: o.items.map((it) => ({
        id: it.id,
        purchaseOrderId: it.purchaseOrderId,
        productId: it.productId,
        product: {
          id: it.product.id,
          organizationId: it.product.organizationId,
          sku: it.product.sku,
          name: it.product.name,
          type: it.product.type as ProductType,
          uomId: it.product.uomId,
          costPrice: Number(it.product.costPrice),
          salePrice: Number(it.product.salePrice),
          reorderPoint: it.product.reorderPoint,
          isActive: it.product.isActive,
          createdAt: it.product.createdAt,
          updatedAt: it.product.updatedAt,
        },
        orderedQty: Number(it.orderedQty),
        receivedQty: Number(it.receivedQty),
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
      })),
    };
  }

  async create(
    organizationId: string,
    userId: string,
    input: CreatePurchaseOrderInput
  ): Promise<PurchaseOrderDto> {
    if (!input.items || input.items.length === 0) {
      throw new Error('Purchase order must have at least one line item');
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findFirst({
      where: { id: input.supplierId, organizationId },
    });
    if (!supplier) {
      throw new Error('Supplier not found in this organization');
    }

    // Generate readable order number: PO-YYYYMM-XXXX
    const count = await prisma.purchaseOrder.count({ where: { organizationId } });
    const orderNumber = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;

    let totalAmount = new Decimal(0);
    const itemData = input.items.map((item) => {
      const orderedQty = new Decimal(item.orderedQty);
      const unitPrice = new Decimal(item.unitPrice);
      const totalPrice = orderedQty.mul(unitPrice);
      totalAmount = totalAmount.add(totalPrice);

      return {
        productId: item.productId,
        orderedQty,
        receivedQty: new Decimal(0),
        unitPrice,
        totalPrice,
      };
    });

    const created = await prisma.purchaseOrder.create({
      data: {
        organizationId,
        orderNumber,
        supplierId: input.supplierId,
        status: 'DRAFT',
        expectedDate: input.expectedDate ? new Date(input.expectedDate) : null,
        totalAmount,
        notes: input.notes?.trim() || null,
        createdBy: userId,
        items: {
          create: itemData,
        },
      },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
      },
    });

    return {
      id: created.id,
      organizationId: created.organizationId,
      orderNumber: created.orderNumber,
      supplierId: created.supplierId,
      supplier: created.supplier,
      status: created.status,
      orderDate: created.orderDate,
      expectedDate: created.expectedDate,
      totalAmount: Number(created.totalAmount),
      notes: created.notes,
      createdBy: created.createdBy,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      items: created.items.map((it) => ({
        id: it.id,
        purchaseOrderId: it.purchaseOrderId,
        productId: it.productId,
        product: {
          id: it.product.id,
          organizationId: it.product.organizationId,
          sku: it.product.sku,
          name: it.product.name,
          type: it.product.type as ProductType,
          uomId: it.product.uomId,
          costPrice: Number(it.product.costPrice),
          salePrice: Number(it.product.salePrice),
          reorderPoint: it.product.reorderPoint,
          isActive: it.product.isActive,
          createdAt: it.product.createdAt,
          updatedAt: it.product.updatedAt,
        },
        orderedQty: Number(it.orderedQty),
        receivedQty: Number(it.receivedQty),
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
      })),
    };
  }

  async updateStatus(
    organizationId: string,
    id: string,
    status: PurchaseOrderStatus,
    notes?: string
  ): Promise<PurchaseOrderDto> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Purchase order not found');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
      },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
      },
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      orderNumber: updated.orderNumber,
      supplierId: updated.supplierId,
      supplier: updated.supplier,
      status: updated.status,
      orderDate: updated.orderDate,
      expectedDate: updated.expectedDate,
      totalAmount: Number(updated.totalAmount),
      notes: updated.notes,
      createdBy: updated.createdBy,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      items: updated.items.map((it) => ({
        id: it.id,
        purchaseOrderId: it.purchaseOrderId,
        productId: it.productId,
        orderedQty: Number(it.orderedQty),
        receivedQty: Number(it.receivedQty),
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
      })),
    };
  }

  /**
   * Non-Functional ACID Guarantee:
   * Receiving goods automatically increments warehouse stock levels,
   * creates immutable stock movement ledger entries, and updates PO fulfillment status.
   */
  async receiveGoods(
    organizationId: string,
    userId: string,
    input: CreateGoodsReceiptInput
  ): Promise<GoodsReceiptDto> {
    return prisma.$transaction(async (tx) => {
      // 1. Verify PO
      const po = await tx.purchaseOrder.findFirst({
        where: { id: input.purchaseOrderId, organizationId },
        include: { items: true },
      });

      if (!po) {
        throw new Error('Purchase order not found');
      }

      if (po.status === 'CANCELLED' || po.status === 'COMPLETED') {
        throw new Error(`Cannot receive goods for order in ${po.status} status`);
      }

      // 2. Verify Warehouse
      const warehouse = await tx.warehouse.findFirst({
        where: { id: input.warehouseId, organizationId },
      });
      if (!warehouse) {
        throw new Error('Receiving warehouse not found');
      }

      // 3. Generate Receipt Number: GRN-YYYYMM-XXXX
      const grnCount = await tx.goodsReceipt.count({ where: { organizationId } });
      const receiptNumber = `GRN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(grnCount + 1).padStart(4, '0')}`;

      // 4. Create Goods Receipt
      const receipt = await tx.goodsReceipt.create({
        data: {
          organizationId,
          receiptNumber,
          purchaseOrderId: po.id,
          warehouseId: input.warehouseId,
          receivedBy: userId,
          notes: input.notes?.trim() || null,
          items: {
            create: input.items.map((it) => ({
              productId: it.productId,
              quantity: new Decimal(it.quantity),
            })),
          },
        },
        include: {
          items: true,
          warehouse: true,
        },
      });

      // 5. Update Stock Levels & PO Item quantities
      for (const item of input.items) {
        const qty = new Decimal(item.quantity);

        // Update PO item received quantity
        const poItem = po.items.find((p) => p.productId === item.productId);
        if (poItem) {
          await tx.purchaseOrderItem.update({
            where: { id: poItem.id },
            data: { receivedQty: { increment: qty } },
          });
        }

        // Upsert stock level in destination warehouse
        const currentStock = await tx.stockLevel.findUnique({
          where: {
            organizationId_productId_warehouseId: {
              organizationId,
              productId: item.productId,
              warehouseId: input.warehouseId,
            },
          },
        });

        if (currentStock) {
          await tx.stockLevel.update({
            where: { id: currentStock.id },
            data: { quantityOnHand: { increment: qty } },
          });
        } else {
          await tx.stockLevel.create({
            data: {
              organizationId,
              productId: item.productId,
              warehouseId: input.warehouseId,
              quantityOnHand: qty,
              reservedQty: new Decimal(0),
            },
          });
        }

        // Create Stock Movement Ledger entry
        await tx.stockMovement.create({
          data: {
            organizationId,
            productId: item.productId,
            destWarehouseId: input.warehouseId,
            quantity: qty,
            type: 'RECEIPT',
            referenceNumber: receiptNumber,
            notes: `Received against ${po.orderNumber}`,
            createdBy: userId,
          },
        });
      }

      // 6. Recalculate PO overall status
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: po.id },
      });

      const allCompleted = updatedPoItems.every(
        (it) => Number(it.receivedQty) >= Number(it.orderedQty)
      );

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: {
          status: allCompleted ? 'COMPLETED' : 'PARTIALLY_RECEIVED',
        },
      });

      return {
        id: receipt.id,
        organizationId: receipt.organizationId,
        receiptNumber: receipt.receiptNumber,
        purchaseOrderId: receipt.purchaseOrderId,
        warehouseId: receipt.warehouseId,
        warehouse: receipt.warehouse,
        receivedDate: receipt.receivedDate,
        receivedBy: receipt.receivedBy,
        notes: receipt.notes,
        createdAt: receipt.createdAt,
        updatedAt: receipt.createdAt,
        items: receipt.items.map((it) => ({
          id: it.id,
          goodsReceiptId: it.goodsReceiptId,
          productId: it.productId,
          quantity: Number(it.quantity),
        })),
      };
    });
  }
}

export const purchaseService = new PurchaseService();
