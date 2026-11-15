import { prisma } from '../../database/prisma.service.js';

export interface OperationalDashboardMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  pendingPurchaseOrders: number;
  totalInventoryValuation: number;
  totalStockUnits: number;
  lowStockCount: number;
  unreadAlertsCount: number;
  recentMovements: Array<{
    id: string;
    productName: string;
    sku: string;
    type: string;
    quantity: number;
    referenceNumber: string | null;
    createdAt: Date;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    supplierName: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
  }>;
}

export class DashboardService {
  async getOperationalMetrics(organizationId: string): Promise<OperationalDashboardMetrics> {
    const [
      totalProducts,
      totalWarehouses,
      totalSuppliers,
      pendingPurchaseOrders,
      unreadAlertsCount,
      stockLevels,
      recentMovementsData,
      recentOrdersData,
    ] = await Promise.all([
      prisma.product.count({ where: { organizationId, isActive: true } }),
      prisma.warehouse.count({ where: { organizationId, isActive: true } }),
      prisma.supplier.count({ where: { organizationId, isActive: true } }),
      prisma.purchaseOrder.count({
        where: {
          organizationId,
          status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
        },
      }),
      prisma.notification.count({ where: { organizationId, isRead: false } }),
      prisma.stockLevel.findMany({
        where: { organizationId },
        include: { product: true },
      }),
      prisma.stockMovement.findMany({
        where: { organizationId },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.purchaseOrder.findMany({
        where: { organizationId },
        include: { supplier: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Financial Calculation: Inventory Valuation
    let totalInventoryValuation = 0;
    let totalStockUnits = 0;

    for (const sl of stockLevels) {
      const qty = Number(sl.quantityOnHand);
      const cost = Number(sl.product.costPrice);
      totalStockUnits += qty;
      totalInventoryValuation += qty * cost;
    }

    // Low stock count calculation
    const productsWithReorder = await prisma.product.findMany({
      where: { organizationId, isActive: true, type: 'STORABLE' },
      include: { stockLevels: true },
    });

    let lowStockCount = 0;
    for (const p of productsWithReorder) {
      const stock = p.stockLevels.reduce(
        (sum, sl) => sum + Number(sl.quantityOnHand),
        0
      );
      if (stock <= p.reorderPoint) {
        lowStockCount++;
      }
    }

    return {
      totalProducts,
      totalWarehouses,
      totalSuppliers,
      pendingPurchaseOrders,
      totalInventoryValuation: Math.round(totalInventoryValuation * 100) / 100,
      totalStockUnits: Math.round(totalStockUnits * 1000) / 1000,
      lowStockCount,
      unreadAlertsCount,
      recentMovements: recentMovementsData.map((m) => ({
        id: m.id,
        productName: m.product.name,
        sku: m.product.sku,
        type: m.type,
        quantity: Number(m.quantity),
        referenceNumber: m.referenceNumber,
        createdAt: m.createdAt,
      })),
      recentOrders: recentOrdersData.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        supplierName: o.supplier.name,
        status: o.status,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
