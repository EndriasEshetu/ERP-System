import { Request, Response } from 'express';
import { ApiResponse, HTTP_STATUS, UnitOfMeasurementDto } from '@erp/shared';
import { uomService } from './uom.service.js';

export class UomController {
  async list(req: Request, res: Response<ApiResponse<UnitOfMeasurementDto[]>>): Promise<void> {
    try {
      const items = await uomService.list(req.organizationId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Units of measurement retrieved successfully',
        data: items,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve UoMs';
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
      const item = await uomService.getById(req.organizationId, id);
      if (!item) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Unit of measurement not found',
        });
        return;
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Unit of measurement retrieved',
        data: item,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error retrieving UoM';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, symbol, category } = req.body;
      if (!name || !symbol) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Name and symbol are required fields',
        });
        return;
      }

      const created = await uomService.create(req.organizationId, { name, symbol, category });
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Unit of measurement created successfully',
        data: created,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create UoM';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await uomService.update(req.organizationId, id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Unit of measurement updated successfully',
        data: updated,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update UoM';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await uomService.delete(req.organizationId, id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Unit of measurement deleted successfully',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete UoM';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }
}

export const uomController = new UomController();
