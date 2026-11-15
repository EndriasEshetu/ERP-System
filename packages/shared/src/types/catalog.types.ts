import { TenantScopedEntity } from './common.types.js';

export type ProductType = 'STORABLE' | 'CONSUMABLE' | 'SERVICE';

// ==========================================
// Unit of Measurement (UoM)
// ==========================================

export interface UnitOfMeasurementDto extends TenantScopedEntity {
  name: string;
  symbol: string;
  category?: string | null;
}

export interface CreateUomInput {
  name: string;
  symbol: string;
  category?: string;
}

export interface UpdateUomInput {
  name?: string;
  symbol?: string;
  category?: string;
}

// ==========================================
// Category
// ==========================================

export interface CategoryDto extends TenantScopedEntity {
  name: string;
  code?: string | null;
  parentId?: string | null;
  children?: CategoryDto[];
}

export interface CreateCategoryInput {
  name: string;
  code?: string;
  parentId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  code?: string;
  parentId?: string | null;
}

// ==========================================
// Product
// ==========================================

export interface ProductDto extends TenantScopedEntity {
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  type: ProductType;
  categoryId?: string | null;
  category?: CategoryDto | null;
  uomId: string;
  uom?: UnitOfMeasurementDto | null;
  costPrice: number;
  salePrice: number;
  reorderPoint: number;
  isActive: boolean;
  totalQuantityOnHand?: number;
}

export interface CreateProductInput {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  type?: ProductType;
  categoryId?: string;
  uomId: string;
  costPrice?: number;
  salePrice?: number;
  reorderPoint?: number;
  isActive?: boolean;
}

export interface UpdateProductInput {
  sku?: string;
  barcode?: string;
  name?: string;
  description?: string;
  type?: ProductType;
  categoryId?: string | null;
  uomId?: string;
  costPrice?: number;
  salePrice?: number;
  reorderPoint?: number;
  isActive?: boolean;
}

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  type?: ProductType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
