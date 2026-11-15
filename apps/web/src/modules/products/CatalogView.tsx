import { useState, useEffect } from 'react';
import {
  ProductDto,
  UnitOfMeasurementDto,
  CategoryDto,
  ProductType,
} from '@erp/shared';
import {
  fetchProducts,
  createProduct,
  deleteProduct,
  fetchUoms,
  createUom,
  deleteUom,
  fetchCategories,
  createCategory,
  deleteCategory,
} from '../../services/catalog.service.js';
import {
  Package,
  Ruler,
  Tags,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Search,
} from 'lucide-react';

export function CatalogView() {
  const [activeTab, setActiveTab] = useState<'products' | 'uom' | 'categories'>('products');

  // Data states
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [uoms, setUoms] = useState<UnitOfMeasurementDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modal / Form toggle states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showUomForm, setShowUomForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    description: '',
    type: 'STORABLE' as ProductType,
    categoryId: '',
    uomId: '',
    costPrice: 0,
    salePrice: 0,
    reorderPoint: 10,
  });

  const [uomForm, setUomForm] = useState({
    name: '',
    symbol: '',
    category: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    parentId: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uomList, catList, prodList] = await Promise.all([
        fetchUoms(),
        fetchCategories(),
        fetchProducts(searchTerm || undefined),
      ]);
      setUoms(uomList);
      setCategories(catList);
      setProducts(prodList);
      if (uomList.length > 0 && !productForm.uomId && uomList[0]) {
        setProductForm((prev) => ({ ...prev, uomId: uomList[0]!.id }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createProduct({
        ...productForm,
        categoryId: productForm.categoryId || undefined,
        costPrice: Number(productForm.costPrice),
        salePrice: Number(productForm.salePrice),
        reorderPoint: Number(productForm.reorderPoint),
      });
      setSuccessMsg(`Product ${productForm.sku} created successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowProductForm(false);
      setProductForm({
        sku: '',
        name: '',
        description: '',
        type: 'STORABLE',
        categoryId: '',
        uomId: uoms[0]?.id || '',
        costPrice: 0,
        salePrice: 0,
        reorderPoint: 10,
      });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const handleCreateUom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createUom(uomForm);
      setSuccessMsg(`Unit "${uomForm.name}" created!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowUomForm(false);
      setUomForm({ name: '', symbol: '', category: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create unit');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createCategory({
        name: categoryForm.name,
        code: categoryForm.code || undefined,
        parentId: categoryForm.parentId || undefined,
      });
      setSuccessMsg(`Category "${categoryForm.name}" created!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowCategoryForm(false);
      setCategoryForm({ name: '', code: '', parentId: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete or deactivate this product?')) return;
    try {
      await deleteProduct(id);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleDeleteUom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this unit of measurement?')) return;
    try {
      await deleteUom(id);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete unit');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'products'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('uom')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'uom'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Units of Measurement ({uoms.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'categories'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>
        </div>

        {/* Action Button & Loader */}
        <div className="flex items-center gap-3">
          {loading && <span className="text-xs text-sky-400 animate-pulse">Updating...</span>}
          {activeTab === 'products' && (
            <button
              onClick={() => setShowProductForm(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
          {activeTab === 'uom' && (
            <button
              onClick={() => setShowUomForm(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Unit</span>
            </button>
          )}
          {activeTab === 'categories' && (
            <button
              onClick={() => setShowCategoryForm(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by SKU, Name or Barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* New Product Form Modal */}
          {showProductForm && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur">
              <h3 className="text-sm font-semibold text-white mb-4">Create New Product</h3>
              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">SKU *</label>
                  <input
                    required
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. PROD-001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Product Name *</label>
                  <input
                    required
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Industrial Steel Bolt"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Type</label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value as ProductType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="STORABLE">Storable (Stock Tracked)</option>
                    <option value="CONSUMABLE">Consumable (Non-Tracked)</option>
                    <option value="SERVICE">Service (Labor/Service)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit of Measurement (UoM) *</label>
                  {uoms.length === 0 ? (
                    <p className="text-amber-400 text-[11px] p-2 bg-amber-500/10 rounded">
                      Please create at least one UoM in the Units tab first.
                    </p>
                  ) : (
                    <select
                      required
                      value={productForm.uomId}
                      onChange={(e) => setProductForm({ ...productForm, uomId: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      {uoms.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="">(None)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={productForm.reorderPoint}
                    onChange={(e) => setProductForm({ ...productForm, reorderPoint: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uoms.length === 0}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg font-medium"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">UoM</th>
                  <th className="p-3 text-right">Cost Price</th>
                  <th className="p-3 text-right">Sale Price</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No products found. Start by adding a Unit of Measurement and your first Product.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono text-sky-400 font-semibold">{p.sku}</td>
                      <td className="p-3 text-white font-medium">{p.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
                          {p.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{p.category?.name || '—'}</td>
                      <td className="p-3 text-slate-400">{p.uom?.symbol || '—'}</td>
                      <td className="p-3 text-right text-slate-300">${p.costPrice.toFixed(2)}</td>
                      <td className="p-3 text-right text-emerald-400 font-medium">${p.salePrice.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition"
                          title="Delete / Deactivate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UNITS OF MEASUREMENT */}
      {activeTab === 'uom' && (
        <div className="space-y-4">
          {showUomForm && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur">
              <h3 className="text-sm font-semibold text-white mb-4">Create Unit of Measurement</h3>
              <form onSubmit={handleCreateUom} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Unit Name *</label>
                  <input
                    required
                    type="text"
                    value={uomForm.name}
                    onChange={(e) => setUomForm({ ...uomForm, name: e.target.value })}
                    placeholder="e.g. Kilogram, Piece, Liter"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Symbol *</label>
                  <input
                    required
                    type="text"
                    value={uomForm.symbol}
                    onChange={(e) => setUomForm({ ...uomForm, symbol: e.target.value })}
                    placeholder="e.g. kg, pcs, L"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category (Optional)</label>
                  <input
                    type="text"
                    value={uomForm.category}
                    onChange={(e) => setUomForm({ ...uomForm, category: e.target.value })}
                    placeholder="e.g. Weight, Volume, Count"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUomForm(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                  >
                    Save Unit
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Unit Name</th>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {uoms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No units of measurement created yet. Click "Add Unit" to create one.
                    </td>
                  </tr>
                ) : (
                  uoms.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-white font-medium">{u.name}</td>
                      <td className="p-3 font-mono text-sky-400 font-semibold">{u.symbol}</td>
                      <td className="p-3 text-slate-400">{u.category || 'General'}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteUom(u.id)}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {showCategoryForm && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur">
              <h3 className="text-sm font-semibold text-white mb-4">Create Product Category</h3>
              <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Category Name *</label>
                  <input
                    required
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Raw Materials, Electronics"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Code (Optional)</label>
                  <input
                    type="text"
                    value={categoryForm.code}
                    onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                    placeholder="e.g. RAW, ELEC"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Parent Category</label>
                  <select
                    value={categoryForm.parentId}
                    onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="">(None - Top Level)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Category Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Subcategories</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No categories created yet. Click "Add Category" to create one.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-white font-medium">{c.name}</td>
                      <td className="p-3 font-mono text-sky-400">{c.code || '—'}</td>
                      <td className="p-3 text-slate-400">{c.children?.length || 0} subcategories</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
