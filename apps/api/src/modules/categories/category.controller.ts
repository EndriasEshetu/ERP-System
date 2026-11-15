import { Request, Response } from 'express';
import { ApiResponse, HTTP_STATUS, CategoryDto } from '@erp/shared';
import { categoryService } from './category.service.js';

export class CategoryController {
  async list(req: Request, res: Response<ApiResponse<CategoryDto[]>>): Promise<void> {
    try {
      const categories = await categoryService.list(req.organizationId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to retrieve categories';
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
      const category = await categoryService.getById(req.organizationId, id);
      if (!category) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error retrieving category';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: msg,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, code, parentId } = req.body;
      if (!name) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Category name is required',
        });
        return;
      }

      const created = await categoryService.create(req.organizationId, { name, code, parentId });
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Category created successfully',
        data: created,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create category';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await categoryService.update(req.organizationId, id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Category updated successfully',
        data: updated,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update category';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await categoryService.delete(req.organizationId, id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete category';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: msg,
      });
    }
  }
}

export const categoryController = new CategoryController();
