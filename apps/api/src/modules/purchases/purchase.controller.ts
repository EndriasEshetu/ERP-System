import { Request, Response } from 'express';
import { HTTP_STATUS } from '@erp/shared';
import { purchaseService } from './purchase.service.js';

export class PurchaseController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const orders = await purchaseService.list(
        req.organizationId,
        typeof status === 'string' ? (status as any) : undefined
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Purchase orders retrieved successfully',
        data: orders,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve purchase orders';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
        data: [],
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const order = await purchaseService.getById(req.organizationId, id);
      if (!order) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Purchase order not found',
        });
        return;
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Purchase order retrieved successfully',
        data: order,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error retrieving purchase order';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId, items } = req.body;
      if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Supplier ID and at least one line item are required',
        });
        return;
      }

      const order = await purchaseService.create(req.organizationId, req.userId, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Purchase order created successfully',
        data: order,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create purchase order';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { status, notes } = req.body;
      if (!status) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Status is required',
        });
        return;
      }

      const updated = await purchaseService.updateStatus(req.organizationId, id, status, notes);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Purchase order status updated to ${status}`,
        data: updated,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update order status';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async receiveGoods(req: Request, res: Response): Promise<void> {
    try {
      const { purchaseOrderId, warehouseId, items } = req.body;
      if (!purchaseOrderId || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Purchase Order ID, Warehouse ID, and receiving items are required',
          data: null,
        });
        return;
      }

      const receipt = await purchaseService.receiveGoods(req.organizationId, req.userId, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Goods received and stock incremented successfully',
        data: receipt,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to process goods receipt';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
        data: null,
      });
    }
  }
}

export const purchaseController = new PurchaseController();
