import { Request, Response } from 'express';
import { HTTP_STATUS } from '@erp/shared';
import { inventoryService } from './inventory.service.js';

export class InventoryController {
  async getStockLevels(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId, productId } = req.query;
      const levels = await inventoryService.getStockLevels(
        req.organizationId,
        typeof warehouseId === 'string' ? warehouseId : undefined,
        typeof productId === 'string' ? productId : undefined
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Stock levels retrieved successfully',
        data: levels,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve stock levels';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
        data: [],
      });
    }
  }

  async getStockMovements(req: Request, res: Response): Promise<void> {
    try {
      const { productId, warehouseId, limit } = req.query;
      const movements = await inventoryService.getStockMovements(
        req.organizationId,
        typeof productId === 'string' ? productId : undefined,
        typeof warehouseId === 'string' ? warehouseId : undefined,
        limit ? parseInt(limit as string, 10) : 50
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Stock movement ledger retrieved successfully',
        data: movements,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve stock movements';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
        data: [],
      });
    }
  }

  async recordMovement(req: Request, res: Response): Promise<void> {
    try {
      const { productId, quantity, type } = req.body;
      if (!productId || !quantity || !type) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Product ID, Quantity, and Movement Type are required',
        });
        return;
      }

      const movement = await inventoryService.recordMovement(req.organizationId, req.userId, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Stock movement recorded successfully',
        data: movement,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to record stock movement';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async adjustStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId, warehouseId, actualQuantity, reason } = req.body;
      if (!productId || !warehouseId || actualQuantity === undefined) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Product ID, Warehouse ID, and Actual Quantity are required',
        });
        return;
      }

      const result = await inventoryService.adjustStock(req.organizationId, req.userId, {
        productId,
        warehouseId,
        actualQuantity: Number(actualQuantity),
        reason,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Stock adjusted successfully',
        data: result,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to adjust stock';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { productId, warehouseId, requiredQty } = req.body;
      if (!productId || requiredQty === undefined) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Product ID and required quantity are required',
          data: {
            productId: productId || '',
            isAvailable: false,
            quantityOnHand: 0,
            reservedQty: 0,
            availableQty: 0,
          },
        });
        return;
      }

      const result = await inventoryService.checkAvailability(req.organizationId, {
        productId,
        warehouseId,
        requiredQty: Number(requiredQty),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Stock availability verified',
        data: result,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error checking stock availability';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
        data: {
          productId: req.body?.productId || '',
          isAvailable: false,
          quantityOnHand: 0,
          reservedQty: 0,
          availableQty: 0,
        },
      });
    }
  }
}

export const inventoryController = new InventoryController();
