import { TenantScopedEntity } from './common.types.js';
import { ProductDto } from './catalog.types.js';

export type MovementType =
  | 'RECEIPT'
  | 'DELIVERY'
  | 'INTERNAL'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT';

// ==========================================
// Warehouse
// ==========================================

export interface WarehouseDto extends TenantScopedEntity {
  name: string;
  code: string;
  address?: string | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateWarehouseInput {
  name: string;
  code: string;
  address?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateWarehouseInput {
  name?: string;
  code?: string;
  address?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

// ==========================================
// Stock Level & Availability
// ==========================================

export interface StockLevelDto extends TenantScopedEntity {
  productId: string;
  warehouseId: string;
  quantityOnHand: number;
  reservedQty: number;
  availableQty: number;
  product?: ProductDto;
  warehouse?: WarehouseDto;
}

export interface StockCheckRequest {
  productId: string;
  warehouseId?: string;
  requiredQty: number;
}

export interface StockCheckResult {
  productId: string;
  isAvailable: boolean;
  quantityOnHand: number;
  reservedQty: number;
  availableQty: number;
}

// ==========================================
// Stock Movement
// ==========================================

export interface StockMovementDto extends TenantScopedEntity {
  productId: string;
  sourceWarehouseId?: string | null;
  destWarehouseId?: string | null;
  quantity: number;
  type: MovementType;
  referenceNumber?: string | null;
  notes?: string | null;
  createdBy: string;
  product?: ProductDto;
  sourceWarehouse?: WarehouseDto | null;
  destWarehouse?: WarehouseDto | null;
}

export interface CreateStockMovementInput {
  productId: string;
  sourceWarehouseId?: string;
  destWarehouseId?: string;
  quantity: number;
  type: MovementType;
  referenceNumber?: string;
  notes?: string;
}

export interface StockAdjustmentInput {
  productId: string;
  warehouseId: string;
  actualQuantity: number;
  reason: string;
}
