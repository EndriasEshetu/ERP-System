import { Request, Response } from 'express';
import { ApiResponse, HTTP_STATUS, WarehouseDto } from '@erp/shared';
import { warehouseService } from './warehouse.service.js';

export class WarehouseController {
  async list(req: Request, res: Response<ApiResponse<WarehouseDto[]>>): Promise<void> {
    try {
      const items = await warehouseService.list(req.organizationId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Warehouses retrieved successfully',
        data: items,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve warehouses';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: true,
        message: msg,
        data: [],
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const item = await warehouseService.getById(req.organizationId, id);
      if (!item) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Warehouse not found',
        });
        return;
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Warehouse retrieved successfully',
        data: item,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error retrieving warehouse';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, code } = req.body;
      if (!name || !code) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Warehouse Name and Code are required',
        });
        return;
      }

      const created = await warehouseService.create(req.organizationId, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Warehouse created successfully',
        data: created,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create warehouse';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await warehouseService.update(req.organizationId, id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Warehouse updated successfully',
        data: updated,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update warehouse';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await warehouseService.delete(req.organizationId, id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Warehouse deleted successfully',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete warehouse';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }
}

export const warehouseController = new WarehouseController();
