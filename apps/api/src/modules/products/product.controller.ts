import { Request, Response } from 'express';
import { HTTP_STATUS, PaginatedApiResponse, ProductDto } from '@erp/shared';
import { productService } from './product.service.js';

export class ProductController {
  async list(req: Request, res: Response<PaginatedApiResponse<ProductDto>>): Promise<void> {
    try {
      const { search, categoryId, type, isActive, page, limit } = req.query;

      const result = await productService.list(req.organizationId, {
        search: typeof search === 'string' ? search : undefined,
        categoryId: typeof categoryId === 'string' ? categoryId : undefined,
        type: typeof type === 'string' ? (type as any) : undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve products';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: true,
        message: msg,
        data: {
          items: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const product = await productService.getById(req.organizationId, id);
      if (!product) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error retrieving product';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { sku, name, uomId } = req.body;
      if (!sku || !name || !uomId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'SKU, Name, and Unit of Measurement (uomId) are required fields',
        });
        return;
      }

      const created = await productService.create(req.organizationId, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Product created successfully',
        data: created,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create product';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await productService.update(req.organizationId, id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update product';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await productService.delete(req.organizationId, id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product deleted or deactivated successfully',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete product';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }
}

export const productController = new ProductController();
