import { prisma } from '../../database/prisma.service.js';
import { CreateNotificationInput, NotificationDto } from '@erp/shared';

export class NotificationService {
  async list(organizationId: string, userId?: string): Promise<NotificationDto[]> {
    const where: any = { organizationId };
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }

    const items = await prisma.notification.findMany({
      where,
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      take: 50,
    });

    return items.map((n) => ({
      id: n.id,
      organizationId: n.organizationId,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      updatedAt: n.createdAt,
    }));
  }

  async create(organizationId: string, input: CreateNotificationInput): Promise<NotificationDto> {
    const n = await prisma.notification.create({
      data: {
        organizationId,
        userId: input.userId || null,
        title: input.title.trim(),
        message: input.message.trim(),
        type: input.type,
        isRead: false,
      },
    });

    return {
      id: n.id,
      organizationId: n.organizationId,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      updatedAt: n.createdAt,
    };
  }

  async markAsRead(organizationId: string, id: string): Promise<NotificationDto> {
    const n = await prisma.notification.update({
      where: { id, organizationId },
      data: { isRead: true },
    });

    return {
      id: n.id,
      organizationId: n.organizationId,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      updatedAt: n.createdAt,
    };
  }

  async markAllAsRead(organizationId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { organizationId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Automated Low Stock Alert Engine
   */
  async checkAndGenerateLowStockAlerts(organizationId: string): Promise<number> {
    const products = await prisma.product.findMany({
      where: { organizationId, isActive: true, type: 'STORABLE' },
      include: { stockLevels: true },
    });

    let generated = 0;
    for (const p of products) {
      const totalStock = p.stockLevels.reduce(
        (sum, sl) => sum + Number(sl.quantityOnHand),
        0
      );

      if (totalStock <= p.reorderPoint) {
        // Check if an unread notification already exists
        const existingAlert = await prisma.notification.findFirst({
          where: {
            organizationId,
            type: 'LOW_STOCK',
            isRead: false,
            message: { contains: p.sku },
          },
        });

        if (!existingAlert) {
          await this.create(organizationId, {
            title: `Low Stock Alert: ${p.name}`,
            message: `Product ${p.sku} has fallen below its reorder point of ${p.reorderPoint} (Current stock: ${totalStock}).`,
            type: 'LOW_STOCK',
          });
          generated++;
        }
      }
    }

    return generated;
  }
}

export const notificationService = new NotificationService();
