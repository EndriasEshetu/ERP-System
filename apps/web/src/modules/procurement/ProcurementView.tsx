import { useState, useEffect } from 'react';
import {
  PurchaseOrderDto,
  SupplierDto,
  ProductDto,
  WarehouseDto,
  PurchaseOrderStatus,
} from '@erp/shared';
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  receiveGoods,
  fetchSuppliers,
  createSupplier,
  deleteSupplier,
  fetchWarehouses,
} from '../../services/operations.service.js';
import { fetchProducts } from '../../services/catalog.service.js';
import {
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  PackageCheck,
  Check,
  Send,
} from 'lucide-react';

export function ProcurementView() {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');

  const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showPoModal, setShowPoModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [receivingPo, setReceivingPo] = useState<PurchaseOrderDto | null>(null);

  // PO Form state
  const [poForm, setPoForm] = useState({
    supplierId: '',
    expectedDate: '',
    notes: '',
    items: [{ productId: '', orderedQty: 1, unitPrice: 0 }],
  });

  // Supplier Form state
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: 'Net 30',
  });

  // Receive Goods Form state
  const [receiveForm, setReceiveForm] = useState<{
    warehouseId: string;
    notes: string;
    items: Array<{ productId: string; quantity: number }>;
  }>({
    warehouseId: '',
    notes: '',
    items: [],
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [poList, supList, prodList, whList] = await Promise.all([
        fetchPurchaseOrders(),
        fetchSuppliers(),
        fetchProducts(),
        fetchWarehouses(),
      ]);
      setOrders(poList);
      setSuppliers(supList);
      setProducts(prodList);
      setWarehouses(whList);

      if (supList.length > 0 && !poForm.supplierId && supList[0]) {
        setPoForm((prev) => ({ ...prev, supplierId: supList[0]!.id }));
      }
      if (prodList.length > 0 && poForm.items[0] && !poForm.items[0].productId && prodList[0]) {
        setPoForm((prev) => ({
          ...prev,
          items: [{ productId: prodList[0]!.id, orderedQty: 1, unitPrice: prodList[0]!.costPrice }],
        }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading procurement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createPurchaseOrder({
        supplierId: poForm.supplierId,
        expectedDate: poForm.expectedDate || undefined,
        notes: poForm.notes || undefined,
        items: poForm.items.map((it) => ({
          productId: it.productId,
          orderedQty: Number(it.orderedQty),
          unitPrice: Number(it.unitPrice),
        })),
      });
      setSuccessMsg('Purchase order created successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowPoModal(false);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase order');
    }
  };

  const handleUpdateStatus = async (id: string, status: PurchaseOrderStatus) => {
    try {
      await updatePurchaseOrderStatus(id, status);
      setSuccessMsg(`Order updated to ${status}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const openReceiveModal = (po: PurchaseOrderDto) => {
    setReceivingPo(po);
    setReceiveForm({
      warehouseId: warehouses[0]?.id || '',
      notes: '',
      items: po.items.map((it) => ({
        productId: it.productId,
        quantity: Math.max(0, it.orderedQty - it.receivedQty),
      })),
    });
  };

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPo) return;
    setError(null);
    try {
      await receiveGoods({
        purchaseOrderId: receivingPo.id,
        warehouseId: receiveForm.warehouseId,
        notes: receiveForm.notes || undefined,
        items: receiveForm.items.filter((it) => it.quantity > 0),
      });
      setSuccessMsg('Goods Receipt processed! Stock levels incremented.');
      setTimeout(() => setSuccessMsg(null), 3000);
      setReceivingPo(null);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process goods receipt');
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createSupplier(supplierForm);
      setSuccessMsg(`Supplier ${supplierForm.name} registered!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowSupplierModal(false);
      setSupplierForm({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        paymentTerms: 'Net 30',
      });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create supplier');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete supplier');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Purchase Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'suppliers'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Suppliers ({suppliers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {loading && <span className="text-xs text-sky-400 animate-pulse">Updating...</span>}
          {activeTab === 'orders' && (
            <button
              onClick={() => setShowPoModal(true)}
              disabled={suppliers.length === 0 || products.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          )}
          {activeTab === 'suppliers' && (
            <button
              onClick={() => setShowSupplierModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
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

      {/* MODAL: Create Purchase Order */}
      {showPoModal && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-6 backdrop-blur space-y-4">
          <h3 className="text-sm font-semibold text-white">Create Purchase Order (P2P Procurement)</h3>
          <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Supplier *</label>
                <select
                  required
                  value={poForm.supplierId}
                  onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={poForm.expectedDate}
                  onChange={(e) => setPoForm({ ...poForm, expectedDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-800 rounded-lg p-3 space-y-3 bg-slate-950/40">
              <span className="font-semibold text-white">Order Line Items</span>
              {poForm.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 text-[10px] mb-0.5">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const prod = products.find((p) => p.id === e.target.value);
                        const newItems = [...poForm.items];
                        newItems[idx] = {
                          ...newItems[idx]!,
                          productId: e.target.value,
                          unitPrice: prod?.costPrice || 0,
                        };
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-0.5">Ordered Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.orderedQty}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx] = { ...newItems[idx]!, orderedQty: parseFloat(e.target.value) || 1 };
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-0.5">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx] = { ...newItems[idx]!, unitPrice: parseFloat(e.target.value) || 0 };
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Optional delivery instructions"
                value={poForm.notes}
                onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPoModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
              >
                Create Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Goods Receiving (GRN) */}
      {receivingPo && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Receive Goods (GRN) – {receivingPo.orderNumber}</h3>
              <p className="text-xs text-slate-400">Supplier: {receivingPo.supplier?.name}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Inbound Dock
            </span>
          </div>

          <form onSubmit={handleReceiveGoods} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Destination Receiving Warehouse *</label>
              <select
                required
                value={receiveForm.warehouseId}
                onChange={(e) => setReceiveForm({ ...receiveForm, warehouseId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-slate-800 rounded-lg p-3 space-y-2 bg-slate-950/40">
              <span className="font-semibold text-white">Items to Receive into Inventory</span>
              {receivingPo.items.map((it, idx) => (
                <div key={it.id} className="flex items-center justify-between gap-4 p-2 bg-slate-900/80 rounded border border-slate-800">
                  <div>
                    <span className="font-semibold text-white">{it.product?.name}</span>
                    <span className="text-slate-400 font-mono text-[10px] ml-2">({it.product?.sku})</span>
                    <p className="text-[10px] text-slate-500">
                      Ordered: {it.orderedQty} | Already Received: {it.receivedQty}
                    </p>
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Receive Qty</label>
                    <input
                      type="number"
                      min="0"
                      max={it.orderedQty - it.receivedQty}
                      step="any"
                      value={receiveForm.items[idx]?.quantity || 0}
                      onChange={(e) => {
                        const newItems = [...receiveForm.items];
                        newItems[idx] = {
                          productId: it.productId,
                          quantity: parseFloat(e.target.value) || 0,
                        };
                        setReceiveForm({ ...receiveForm, items: newItems });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Receiving Notes / Bill of Lading</label>
              <input
                type="text"
                placeholder="Optional tracking reference"
                value={receiveForm.notes}
                onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReceivingPo(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
              >
                Confirm Goods Receipt & Increment Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">PO Number</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Date</th>
                <th className="p-3">Items</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No purchase orders found. Create a Supplier and PO to begin procurement.
                  </td>
                </tr>
              ) : (
                orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono text-sky-400 font-semibold">{po.orderNumber}</td>
                    <td className="p-3 text-white font-medium">{po.supplier?.name}</td>
                    <td className="p-3 text-slate-400">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="p-3 text-slate-300">{po.items.length} line item(s)</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">${po.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        po.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        po.status === 'APPROVED' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                        po.status === 'PARTIALLY_RECEIVED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        po.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {po.status === 'DRAFT' && (
                          <button
                            onClick={() => handleUpdateStatus(po.id, 'SUBMITTED')}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1"
                            title="Submit for Approval"
                          >
                            <Send className="w-3 h-3 text-sky-400" />
                            <span>Submit</span>
                          </button>
                        )}
                        {po.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleUpdateStatus(po.id, 'APPROVED')}
                            className="px-2 py-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 rounded text-[10px] flex items-center gap-1"
                            title="Approve Order"
                          >
                            <Check className="w-3 h-3 text-sky-400" />
                            <span>Approve</span>
                          </button>
                        )}
                        {(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') && (
                          <button
                            onClick={() => openReceiveModal(po)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium flex items-center gap-1 shadow-sm"
                            title="Receive Goods into Warehouse"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Receive (GRN)</span>
                          </button>
                        )}
                        {po.status === 'COMPLETED' && (
                          <span className="text-[10px] text-slate-500 italic">Fulfilled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          {showSupplierModal && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-6 backdrop-blur">
              <h3 className="text-sm font-semibold text-white mb-4">Register New Supplier / Vendor</h3>
              <form onSubmit={handleCreateSupplier} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Supplier Name *</label>
                  <input
                    required
                    type="text"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    placeholder="e.g. Apex Industrial Supplies"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Supplier Code *</label>
                  <input
                    required
                    type="text"
                    value={supplierForm.code}
                    onChange={(e) => setSupplierForm({ ...supplierForm, code: e.target.value })}
                    placeholder="e.g. SUP-APEX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="sales@supplier.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    placeholder="e.g. Net 30, Due on Receipt"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tax ID / VAT</label>
                  <input
                    type="text"
                    value={supplierForm.taxId}
                    onChange={(e) => setSupplierForm({ ...supplierForm, taxId: e.target.value })}
                    placeholder="e.g. US-987654321"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                  >
                    Save Supplier
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Payment Terms</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No suppliers registered yet. Click "Add Supplier" to create your vendor records.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-white font-medium">{s.name}</td>
                      <td className="p-3 font-mono text-sky-400 font-semibold">{s.code}</td>
                      <td className="p-3 text-slate-400">{s.email || s.phone || '—'}</td>
                      <td className="p-3 text-slate-300">{s.paymentTerms || 'Net 30'}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteSupplier(s.id)}
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
    </div>
  );
}
