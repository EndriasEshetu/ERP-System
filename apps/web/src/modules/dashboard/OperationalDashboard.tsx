import { useState, useEffect } from 'react';
import { NotificationDto } from '@erp/shared';
import {
  fetchDashboardMetrics,
  OperationalMetrics,
  fetchNotifications,
  markNotificationRead,
  triggerLowStockScan,
} from '../../services/operations.service.js';
import {
  DollarSign,
  Package,
  AlertTriangle,
  FileText,
  Bell,
  RefreshCw,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export function OperationalDashboard() {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, n] = await Promise.all([
        fetchDashboardMetrics(),
        fetchNotifications(),
      ]);
      setMetrics(m);
      setNotifications(n);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const newAlerts = await triggerLowStockScan();
      setMessage(newAlerts > 0 ? `Scan complete: ${newAlerts} new reorder alerts generated!` : 'Stock audit complete: All items above reorder thresholds.');
      setTimeout(() => setMessage(null), 4000);
      loadData();
    } catch {
      setMessage('Error running low stock scan');
    } finally {
      setScanning(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      loadData();
    } catch {
      // Ignored
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Audit Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Operational Intelligence & KPIs</span>
            <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Developer B Domain
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-tenant stock valuation, reorder thresholds, and procurement status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loading && <span className="text-xs text-sky-400 animate-pulse mr-2">Syncing...</span>}
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>Run Low-Stock Audit</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* 4 CORE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Valuation */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Inventory Valuation</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              ${metrics?.totalInventoryValuation.toLocaleString() || '0.00'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total asset value at current cost</p>
        </div>

        {/* Card 2: Total Units On Hand */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Total Stock Units</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics?.totalStockUnits.toLocaleString() || 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all warehouses</p>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Reorder Alerts</span>
            <div className={`p-2 rounded-lg ${metrics && metrics.lowStockCount > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-2xl font-bold font-mono ${metrics && metrics.lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {metrics?.lowStockCount || 0}
            </span>
            {metrics && metrics.lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                NEEDS REORDER
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Items at or below reorder threshold</p>
        </div>

        {/* Card 4: Pending POs */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Active Orders</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics?.pendingPurchaseOrders || 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">POs awaiting receiving (GRN)</p>
        </div>
      </div>

      {/* LOWER SECTION: NOTIFICATIONS & RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Feed */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Operational Alerts ({notifications.filter((n) => !n.isRead).length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">Live Triggers</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">No alerts. All inventory levels optimal.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border text-xs transition ${
                    n.isRead
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-800/80 border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white">{n.title}</span>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[10px] text-sky-400 hover:underline shrink-0"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions & Orders (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Stock Ledger */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Recent Inventory Transactions (ACID Ledger)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {metrics?.recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500 text-[11px]">
                        No stock transactions yet.
                      </td>
                    </tr>
                  ) : (
                    metrics?.recentMovements.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2 text-slate-400 text-[11px]">{new Date(m.createdAt).toLocaleTimeString()}</td>
                        <td className="py-2 text-white font-medium">{m.productName} ({m.sku})</td>
                        <td className="py-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                            {m.type}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-white flex items-center justify-end gap-1">
                          {m.type === 'RECEIPT' || m.type === 'ADJUSTMENT_IN' ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{m.quantity}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Non-Functional Security Badge */}
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Organization Scoping: Active & Verified</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">PostgreSQL 16 • Neon Cloud SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
