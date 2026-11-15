import {
  ApiResponse,
  WarehouseDto,
  CreateWarehouseInput,
  StockLevelDto,
  StockMovementDto,
  CreateStockMovementInput,
  StockAdjustmentInput,
  SupplierDto,
  CreateSupplierInput,
  PurchaseOrderDto,
  CreatePurchaseOrderInput,
  PurchaseOrderStatus,
  GoodsReceiptDto,
  CreateGoodsReceiptInput,
  NotificationDto,
} from '@erp/shared';

const API_BASE = 'http://localhost:5000/api/v1';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-organization-id': '00000000-0000-0000-0000-000000000001',
};

// ==========================================
// Warehouses API
// ==========================================
export async function fetchWarehouses(): Promise<WarehouseDto[]> {
  const res = await fetch(`${API_BASE}/warehouses`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch warehouses: ${res.statusText}`);
  const json: ApiResponse<WarehouseDto[]> = await res.json();
  return json.data;
}

export async function createWarehouse(input: CreateWarehouseInput): Promise<WarehouseDto> {
  const res = await fetch(`${API_BASE}/warehouses`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<WarehouseDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create warehouse');
  return json.data;
}

export async function deleteWarehouse(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/warehouses/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete warehouse');
}

// ==========================================
// Inventory & Stock Levels API
// ==========================================
export async function fetchStockLevels(warehouseId?: string, productId?: string): Promise<StockLevelDto[]> {
  const params = new URLSearchParams();
  if (warehouseId) params.append('warehouseId', warehouseId);
  if (productId) params.append('productId', productId);

  const res = await fetch(`${API_BASE}/inventory/levels?${params.toString()}`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch stock levels: ${res.statusText}`);
  const json: ApiResponse<StockLevelDto[]> = await res.json();
  return json.data;
}

export async function fetchStockMovements(limit = 50): Promise<StockMovementDto[]> {
  const res = await fetch(`${API_BASE}/inventory/movements?limit=${limit}`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch stock movements: ${res.statusText}`);
  const json: ApiResponse<StockMovementDto[]> = await res.json();
  return json.data;
}

export async function recordStockMovement(input: CreateStockMovementInput): Promise<StockMovementDto> {
  const res = await fetch(`${API_BASE}/inventory/movements`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<StockMovementDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to record stock movement');
  return json.data;
}

export async function adjustStock(input: StockAdjustmentInput): Promise<StockMovementDto> {
  const res = await fetch(`${API_BASE}/inventory/adjust`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<StockMovementDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to adjust stock');
  return json.data;
}

// ==========================================
// Suppliers API
// ==========================================
export async function fetchSuppliers(): Promise<SupplierDto[]> {
  const res = await fetch(`${API_BASE}/suppliers`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch suppliers: ${res.statusText}`);
  const json: ApiResponse<SupplierDto[]> = await res.json();
  return json.data;
}

export async function createSupplier(input: CreateSupplierInput): Promise<SupplierDto> {
  const res = await fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<SupplierDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create supplier');
  return json.data;
}

export async function deleteSupplier(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete supplier');
}

// ==========================================
// Purchase Orders & Goods Receiving API
// ==========================================
export async function fetchPurchaseOrders(status?: PurchaseOrderStatus): Promise<PurchaseOrderDto[]> {
  const url = status ? `${API_BASE}/purchases?status=${status}` : `${API_BASE}/purchases`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch purchase orders: ${res.statusText}`);
  const json: ApiResponse<PurchaseOrderDto[]> = await res.json();
  return json.data;
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrderDto> {
  const res = await fetch(`${API_BASE}/purchases`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<PurchaseOrderDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create purchase order');
  return json.data;
}

export async function updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrderDto> {
  const res = await fetch(`${API_BASE}/purchases/${id}/status`, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: JSON.stringify({ status }),
  });
  const json: ApiResponse<PurchaseOrderDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update order status');
  return json.data;
}

export async function receiveGoods(input: CreateGoodsReceiptInput): Promise<GoodsReceiptDto> {
  const res = await fetch(`${API_BASE}/purchases/receive`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<GoodsReceiptDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to process goods receipt');
  return json.data;
}

// ==========================================
// Notifications API
// ==========================================
export async function fetchNotifications(): Promise<NotificationDto[]> {
  const res = await fetch(`${API_BASE}/notifications`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.statusText}`);
  const json: ApiResponse<NotificationDto[]> = await res.json();
  return json.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: defaultHeaders,
  });
}

export async function triggerLowStockScan(): Promise<number> {
  const res = await fetch(`${API_BASE}/notifications/trigger-check`, {
    method: 'POST',
    headers: defaultHeaders,
  });
  const json = await res.json();
  return json.data?.generatedAlerts || 0;
}

// ==========================================
// Operational Dashboard API
// ==========================================
export interface OperationalMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  pendingPurchaseOrders: number;
  totalInventoryValuation: number;
  totalStockUnits: number;
  lowStockCount: number;
  unreadAlertsCount: number;
  recentMovements: Array<{
    id: string;
    productName: string;
    sku: string;
    type: string;
    quantity: number;
    referenceNumber: string | null;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    supplierName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

export async function fetchDashboardMetrics(): Promise<OperationalMetrics> {
  const res = await fetch(`${API_BASE}/dashboard/operations`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch dashboard metrics: ${res.statusText}`);
  const json: ApiResponse<OperationalMetrics> = await res.json();
  return json.data;
}
