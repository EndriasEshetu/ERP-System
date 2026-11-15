import { Request, Response } from 'express';
import { HTTP_STATUS } from '@erp/shared';
import { dashboardService } from './dashboard.service.js';

export class DashboardController {
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await dashboardService.getOperationalMetrics(req.organizationId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Operational metrics retrieved successfully',
        data: metrics,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve dashboard metrics';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
        data: null,
      });
    }
  }
}

export const dashboardController = new DashboardController();
