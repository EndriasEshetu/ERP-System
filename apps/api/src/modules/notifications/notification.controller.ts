import { Request, Response } from 'express';
import { HTTP_STATUS } from '@erp/shared';
import { notificationService } from './notification.service.js';

export class NotificationController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const notifications = await notificationService.list(req.organizationId, req.userId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve notifications';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
        data: [],
      });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await notificationService.markAsRead(req.organizationId, id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Notification marked as read',
        data: updated,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to mark notification';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.organizationId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to mark all as read';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
      });
    }
  }

  async triggerLowStockCheck(req: Request, res: Response): Promise<void> {
    try {
      const count = await notificationService.checkAndGenerateLowStockAlerts(req.organizationId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Stock audit complete: ${count} new alerts generated`,
        data: { generatedAlerts: count },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error scanning stock thresholds';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
      });
    }
  }
}

export const notificationController = new NotificationController();
