import { TenantScopedEntity } from './common.types.js';
import { ProductDto } from './catalog.types.js';
import { WarehouseDto } from './inventory.types.js';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PARTIALLY_RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED';

// ==========================================
// Supplier
// ==========================================

export interface SupplierDto extends TenantScopedEntity {
  name: string;
  code: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  taxId?: string | null;
  paymentTerms?: string | null;
  isActive: boolean;
}

export interface CreateSupplierInput {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive?: boolean;
}

export interface UpdateSupplierInput {
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive?: boolean;
}

// ==========================================
// Purchase Order
// ==========================================

export interface PurchaseOrderItemDto {
  id: string;
  purchaseOrderId: string;
  productId: string;
  product?: ProductDto;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrderDto extends TenantScopedEntity {
  orderNumber: string;
  supplierId: string;
  supplier?: SupplierDto;
  status: PurchaseOrderStatus;
  orderDate: Date | string;
  expectedDate?: Date | string | null;
  totalAmount: number;
  notes?: string | null;
  createdBy: string;
  items: PurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemInput {
  productId: string;
  orderedQty: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  expectedDate?: string;
  notes?: string;
  items: CreatePurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderStatusInput {
  status: PurchaseOrderStatus;
  notes?: string;
}

// ==========================================
// Goods Receipt
// ==========================================

export interface GoodsReceiptItemDto {
  id: string;
  goodsReceiptId: string;
  productId: string;
  product?: ProductDto;
  quantity: number;
}

export interface GoodsReceiptDto extends TenantScopedEntity {
  receiptNumber: string;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrderDto;
  warehouseId: string;
  warehouse?: WarehouseDto;
  receivedDate: Date | string;
  receivedBy: string;
  notes?: string | null;
  items: GoodsReceiptItemDto[];
}

export interface CreateGoodsReceiptItemInput {
  productId: string;
  quantity: number;
}

export interface CreateGoodsReceiptInput {
  purchaseOrderId: string;
  warehouseId: string;
  notes?: string;
  items: CreateGoodsReceiptItemInput[];
}
