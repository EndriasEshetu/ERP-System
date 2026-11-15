import { prisma } from '../../database/prisma.service.js';
import { CreateCategoryInput, UpdateCategoryInput, CategoryDto } from '@erp/shared';

export class CategoryService {
  async list(organizationId: string): Promise<CategoryDto[]> {
    const categories = await prisma.category.findMany({
      where: { organizationId },
      include: {
        children: true,
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => ({
      id: c.id,
      organizationId: c.organizationId,
      name: c.name,
      code: c.code,
      parentId: c.parentId,
      children: c.children.map((child) => ({
        id: child.id,
        organizationId: child.organizationId,
        name: child.name,
        code: child.code,
        parentId: child.parentId,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
      })),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async getById(organizationId: string, id: string): Promise<CategoryDto | null> {
    const category = await prisma.category.findFirst({
      where: { id, organizationId },
      include: {
        children: true,
      },
    });

    if (!category) return null;

    return {
      id: category.id,
      organizationId: category.organizationId,
      name: category.name,
      code: category.code,
      parentId: category.parentId,
      children: category.children.map((child) => ({
        id: child.id,
        organizationId: child.organizationId,
        name: child.name,
        code: child.code,
        parentId: child.parentId,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
      })),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async create(organizationId: string, input: CreateCategoryInput): Promise<CategoryDto> {
    const existing = await prisma.category.findFirst({
      where: {
        organizationId,
        name: { equals: input.name, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new Error(`Category "${input.name}" already exists`);
    }

    if (input.parentId) {
      const parent = await prisma.category.findFirst({
        where: { id: input.parentId, organizationId },
      });
      if (!parent) {
        throw new Error('Parent category not found in this organization');
      }
    }

    const created = await prisma.category.create({
      data: {
        organizationId,
        name: input.name.trim(),
        code: input.code?.trim() || null,
        parentId: input.parentId || null,
      },
    });

    return {
      id: created.id,
      organizationId: created.organizationId,
      name: created.name,
      code: created.code,
      parentId: created.parentId,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateCategoryInput
  ): Promise<CategoryDto> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Category not found');
    }

    if (input.parentId === id) {
      throw new Error('A category cannot be its own parent');
    }

    if (input.parentId) {
      const parent = await prisma.category.findFirst({
        where: { id: input.parentId, organizationId },
      });
      if (!parent) {
        throw new Error('Parent category not found in this organization');
      }
    }

    if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await prisma.category.findFirst({
        where: {
          organizationId,
          name: { equals: input.name, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new Error(`Category "${input.name}" already exists`);
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: input.name !== undefined ? input.name.trim() : undefined,
        code: input.code !== undefined ? input.code.trim() || null : undefined,
        parentId: input.parentId !== undefined ? input.parentId : undefined,
      },
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      name: updated.name,
      code: updated.code,
      parentId: updated.parentId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const existing = await this.getById(organizationId, id);
    if (!existing) {
      throw new Error('Category not found');
    }

    const childCount = await prisma.category.count({
      where: { organizationId, parentId: id },
    });
    if (childCount > 0) {
      throw new Error(`Cannot delete category: it has ${childCount} subcategory/subcategories`);
    }

    const productCount = await prisma.product.count({
      where: { organizationId, categoryId: id },
    });
    if (productCount > 0) {
      throw new Error(`Cannot delete category: it is assigned to ${productCount} product(s)`);
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();
