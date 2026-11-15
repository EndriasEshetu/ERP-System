import { Request, Response } from 'express';
import { HTTP_STATUS } from '@erp/shared';
import { supplierService } from './supplier.service.js';

export class SupplierController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await supplierService.list(req.organizationId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Suppliers retrieved successfully',
        data: items,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve suppliers';
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
      const item = await supplierService.getById(req.organizationId, id);
      if (!item) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Supplier not found',
        });
        return;
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Supplier retrieved successfully',
        data: item,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error retrieving supplier';
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
          message: 'Supplier Name and Code are required',
        });
        return;
      }

      const created = await supplierService.create(req.organizationId, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Supplier created successfully',
        data: created,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create supplier';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await supplierService.update(req.organizationId, id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Supplier updated successfully',
        data: updated,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update supplier';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await supplierService.delete(req.organizationId, id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Supplier deleted or deactivated successfully',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete supplier';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }
}

export const supplierController = new SupplierController();
