import {
  ApiResponse,
  PaginatedApiResponse,
  UnitOfMeasurementDto,
  CreateUomInput,
  CategoryDto,
  CreateCategoryInput,
  ProductDto,
  CreateProductInput,
} from '@erp/shared';

const API_BASE = 'http://localhost:5000/api/v1';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-organization-id': '00000000-0000-0000-0000-000000000001',
};

// ==========================================
// UoM Service
// ==========================================
export async function fetchUoms(): Promise<UnitOfMeasurementDto[]> {
  const res = await fetch(`${API_BASE}/uom`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch UoMs: ${res.statusText}`);
  const json: ApiResponse<UnitOfMeasurementDto[]> = await res.json();
  return json.data;
}

export async function createUom(input: CreateUomInput): Promise<UnitOfMeasurementDto> {
  const res = await fetch(`${API_BASE}/uom`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<UnitOfMeasurementDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create UoM');
  return json.data;
}

export async function deleteUom(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/uom/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete UoM');
}

// ==========================================
// Category Service
// ==========================================
export async function fetchCategories(): Promise<CategoryDto[]> {
  const res = await fetch(`${API_BASE}/categories`, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
  const json: ApiResponse<CategoryDto[]> = await res.json();
  return json.data;
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryDto> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<CategoryDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create category');
  return json.data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete category');
}

// ==========================================
// Product Service
// ==========================================
export async function fetchProducts(search?: string, categoryId?: string): Promise<ProductDto[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (categoryId) params.append('categoryId', categoryId);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
  const json: PaginatedApiResponse<ProductDto> = await res.json();
  return json.data.items;
}

export async function createProduct(input: CreateProductInput): Promise<ProductDto> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(input),
  });
  const json: ApiResponse<ProductDto> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create product');
  return json.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete product');
}
