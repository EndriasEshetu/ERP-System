import { useState, useEffect } from 'react';
import {
  StockLevelDto,
  StockMovementDto,
  WarehouseDto,
  ProductDto,
  MovementType,
} from '@erp/shared';
import {
  fetchStockLevels,
  fetchStockMovements,
  recordStockMovement,
  fetchWarehouses,
  createWarehouse,
  deleteWarehouse,
} from '../../services/operations.service.js';
import { fetchProducts } from '../../services/catalog.service.js';
import {
  Layers,
  ArrowLeftRight,
  Warehouse as WarehouseIcon,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export function InventoryView() {
  const [activeTab, setActiveTab] = useState<'levels' | 'movements' | 'warehouses'>('levels');

  const [levels, setLevels] = useState<StockLevelDto[]>([]);
  const [movements, setMovements] = useState<StockMovementDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);

  // Forms
  const [movementForm, setMovementForm] = useState({
    productId: '',
    sourceWarehouseId: '',
    destWarehouseId: '',
    quantity: 1,
    type: 'RECEIPT' as MovementType,
    referenceNumber: '',
    notes: '',
  });

  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    code: '',
    address: '',
    isDefault: false,
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wList, pList, lvlList, movList] = await Promise.all([
        fetchWarehouses(),
        fetchProducts(),
        fetchStockLevels(),
        fetchStockMovements(50),
      ]);
      setWarehouses(wList);
      setProducts(pList);
      setLevels(lvlList);
      setMovements(movList);

      if (pList.length > 0 && !movementForm.productId && pList[0]) {
        setMovementForm((prev) => ({ ...prev, productId: pList[0]!.id }));
      }
      if (wList.length > 0 && !movementForm.destWarehouseId && wList[0]) {
        setMovementForm((prev) => ({ ...prev, destWarehouseId: wList[0]!.id }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await recordStockMovement({
        productId: movementForm.productId,
        sourceWarehouseId: movementForm.sourceWarehouseId || undefined,
        destWarehouseId: movementForm.destWarehouseId || undefined,
        quantity: Number(movementForm.quantity),
        type: movementForm.type,
        referenceNumber: movementForm.referenceNumber || undefined,
        notes: movementForm.notes || undefined,
      });
      setSuccessMsg('Stock movement executed and ledger updated!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowMovementModal(false);
      setMovementForm({
        productId: products[0]?.id || '',
        sourceWarehouseId: '',
        destWarehouseId: warehouses[0]?.id || '',
        quantity: 1,
        type: 'RECEIPT',
        referenceNumber: '',
        notes: '',
      });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Movement failed');
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createWarehouse(warehouseForm);
      setSuccessMsg(`Warehouse ${warehouseForm.name} created!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowWarehouseModal(false);
      setWarehouseForm({ name: '', code: '', address: '', isDefault: false });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create warehouse');
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await deleteWarehouse(id);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete warehouse');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('levels')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'levels'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stock Levels ({levels.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'movements'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Movement Ledger ({movements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('warehouses')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'warehouses'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <WarehouseIcon className="w-4 h-4" />
            <span>Warehouses ({warehouses.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {loading && <span className="text-xs text-sky-400 animate-pulse">Updating...</span>}
          {activeTab === 'levels' && (
            <button
              onClick={() => setShowMovementModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Stock Movement</span>
            </button>
          )}
          {activeTab === 'warehouses' && (
            <button
              onClick={() => setShowWarehouseModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Warehouse</span>
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

      {/* MODAL: Record Stock Movement */}
      {showMovementModal && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-6 backdrop-blur space-y-4">
          <h3 className="text-sm font-semibold text-white">Record Stock Transaction (ACID Ledger)</h3>
          <form onSubmit={handleCreateMovement} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Movement Type *</label>
              <select
                value={movementForm.type}
                onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value as MovementType })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="RECEIPT">Inbound Receipt (Increase Stock)</option>
                <option value="DELIVERY">Outbound Delivery (Deduct Stock)</option>
                <option value="INTERNAL">Internal Transfer (Move Warehouses)</option>
                <option value="ADJUSTMENT_IN">Adjustment In (Inventory Audit Surplus)</option>
                <option value="ADJUSTMENT_OUT">Adjustment Out (Damage / Loss)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Product *</label>
              <select
                required
                value={movementForm.productId}
                onChange={(e) => setMovementForm({ ...movementForm, productId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Quantity *</label>
              <input
                required
                type="number"
                min="0.001"
                step="any"
                value={movementForm.quantity}
                onChange={(e) => setMovementForm({ ...movementForm, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            {(movementForm.type === 'DELIVERY' || movementForm.type === 'INTERNAL' || movementForm.type === 'ADJUSTMENT_OUT') && (
              <div>
                <label className="block text-slate-400 mb-1">Source Warehouse *</label>
                <select
                  required
                  value={movementForm.sourceWarehouseId}
                  onChange={(e) => setMovementForm({ ...movementForm, sourceWarehouseId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="">Select source warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {(movementForm.type === 'RECEIPT' || movementForm.type === 'INTERNAL' || movementForm.type === 'ADJUSTMENT_IN') && (
              <div>
                <label className="block text-slate-400 mb-1">Destination Warehouse *</label>
                <select
                  required
                  value={movementForm.destWarehouseId}
                  onChange={(e) => setMovementForm({ ...movementForm, destWarehouseId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="">Select destination warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-slate-400 mb-1">Reference Number</label>
              <input
                type="text"
                placeholder="e.g. INVOICE-1002, AUDIT-01"
                value={movementForm.referenceNumber}
                onChange={(e) => setMovementForm({ ...movementForm, referenceNumber: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-slate-400 mb-1">Notes / Reason</label>
              <input
                type="text"
                placeholder="Optional description"
                value={movementForm.notes}
                onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
              >
                Execute Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: STOCK LEVELS */}
      {activeTab === 'levels' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Product SKU</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Warehouse</th>
                <th className="p-3 text-right">On Hand</th>
                <th className="p-3 text-right">Reserved</th>
                <th className="p-3 text-right">Available</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {levels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No active stock records yet. Click "Record Stock Movement" to receive stock into a warehouse.
                  </td>
                </tr>
              ) : (
                levels.map((lvl) => {
                  const isLow = lvl.quantityOnHand <= (lvl.product?.reorderPoint || 10);
                  return (
                    <tr key={lvl.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono text-sky-400 font-semibold">{lvl.product?.sku}</td>
                      <td className="p-3 text-white font-medium">{lvl.product?.name}</td>
                      <td className="p-3 text-slate-400">{lvl.warehouse?.name} ({lvl.warehouse?.code})</td>
                      <td className="p-3 text-right text-white font-mono font-semibold">{lvl.quantityOnHand}</td>
                      <td className="p-3 text-right text-slate-400 font-mono">{lvl.reservedQty}</td>
                      <td className="p-3 text-right text-emerald-400 font-mono font-bold">{lvl.availableQty}</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: MOVEMENT LEDGER */}
      {activeTab === 'movements' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Product</th>
                <th className="p-3">Flow (Source ➔ Destination)</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No stock transactions recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 text-slate-400">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-mono text-sky-400">{m.referenceNumber || 'MANUAL'}</td>
                    <td className="p-3 text-white font-medium">{m.product?.name} ({m.product?.sku})</td>
                    <td className="p-3 text-slate-300">
                      {m.sourceWarehouse ? m.sourceWarehouse.name : '—'} ➔ {m.destWarehouse ? m.destWarehouse.name : '—'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white flex items-center justify-end gap-1">
                      {m.type === 'RECEIPT' || m.type === 'ADJUSTMENT_IN' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>{m.quantity}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: WAREHOUSES */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          {showWarehouseModal && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-6 backdrop-blur">
              <h3 className="text-sm font-semibold text-white mb-4">Create New Warehouse</h3>
              <form onSubmit={handleCreateWarehouse} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Warehouse Name *</label>
                  <input
                    required
                    type="text"
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    placeholder="e.g. Main Distribution Center"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Warehouse Code *</label>
                  <input
                    required
                    type="text"
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                    placeholder="e.g. WH-MAIN, WH-EAST"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Address / Location</label>
                  <input
                    type="text"
                    value={warehouseForm.address}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                    placeholder="Street, City, Zip"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="sm:col-span-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={warehouseForm.isDefault}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, isDefault: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="isDefault" className="text-slate-300 text-xs">
                    Set as default receiving warehouse
                  </label>
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWarehouseModal(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                  >
                    Save Warehouse
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Warehouse Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Default</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {warehouses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No warehouses created yet. Click "Add Warehouse" to establish your first facility.
                    </td>
                  </tr>
                ) : (
                  warehouses.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 text-white font-medium">{w.name}</td>
                      <td className="p-3 font-mono text-sky-400 font-semibold">{w.code}</td>
                      <td className="p-3 text-slate-400">{w.address || '—'}</td>
                      <td className="p-3">
                        {w.isDefault ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            DEFAULT
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">STANDARD</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteWarehouse(w.id)}
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
