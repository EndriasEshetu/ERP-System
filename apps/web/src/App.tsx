import { useEffect, useState } from 'react';
import { ApiResponse } from '@erp/shared';
import { CatalogView } from './modules/products/CatalogView.js';
import { Activity, Package, Server, ShieldCheck } from 'lucide-react';

interface HealthData {
  status: 'UP' | 'DOWN';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: 'CONNECTED' | 'DISCONNECTED';
}

export default function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'health' | 'catalog'>('catalog');

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/v1/health');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json: ApiResponse<HealthData> = await res.json();
      setHealth(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reach API');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded bg-sky-500/10 text-sky-400 text-xs font-semibold uppercase tracking-wider border border-sky-500/20">
                Commercial Core
              </span>
              <span className="text-xs text-slate-400">Milestone 2 • Product Operations</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
              ERP System Platform
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Modular Monolith ERP inspired by Odoo • Multi-tenant by design
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchHealth}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-2"
            >
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>Probe API</span>
            </button>
          </div>
        </header>

        {/* Main Navigation Tabs */}
        <nav className="flex items-center gap-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setMainTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              mainTab === 'catalog'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Operations & Catalog</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-700 text-emerald-100">
              Developer B
            </span>
          </button>
          <button
            onClick={() => setMainTab('health')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              mainTab === 'health'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>System Health & Overview</span>
          </button>
        </nav>

        {/* VIEW 1: CATALOG MANAGEMENT */}
        {mainTab === 'catalog' && (
          <section className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Product Operations Domain</span>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Vertical Slice
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-tenant catalog engine: Units of Measurement, Hierarchical Categories, and Products.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Tenant-Isolated Scoping Active</span>
              </div>
            </div>

            <CatalogView />
          </section>
        )}

        {/* VIEW 2: SYSTEM HEALTH & ARCHITECTURE OVERVIEW */}
        {mainTab === 'health' && (
          <div className="space-y-8">
            {/* Live System Connectivity Widget */}
            <section className="bg-slate-800/60 border border-slate-800 rounded-xl p-6 backdrop-blur">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
                <span>Live System Health & Connectivity</span>
                {loading && <span className="text-xs text-slate-400 animate-pulse">Checking status...</span>}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Frontend Card */}
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-medium">Frontend Client</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-base font-semibold text-white">ONLINE</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">React 18 • Vite 6 • Tailwind</p>
                </div>

                {/* Backend API Card */}
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-medium">Backend API</span>
                  <div className="mt-2 flex items-center gap-2">
                    {health?.status === 'UP' ? (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-base font-semibold text-white">HEALTHY (UP)</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <span className="text-base font-semibold text-rose-400">
                          {error ? 'UNREACHABLE' : 'CHECKING'}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Express • Node.js • ESM</p>
                </div>

                {/* Database Card */}
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-medium">PostgreSQL Database</span>
                  <div className="mt-2 flex items-center gap-2">
                    {health?.database === 'CONNECTED' ? (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-base font-semibold text-white">CONNECTED</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-base font-semibold text-amber-400">DISCONNECTED</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Neon Cloud • Prisma ORM</p>
                </div>

                {/* Environment Info */}
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-medium">Active Environment</span>
                  <div className="mt-2">
                    <span className="text-base font-semibold text-white uppercase">
                      {health?.environment || 'development'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Uptime: {health ? `${Math.floor(health.uptime)}s` : 'N/A'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <strong>API Connection Notice:</strong> {error}. Ensure backend is running via{' '}
                  <code className="bg-slate-950 px-1 py-0.5 rounded">npm run dev:api</code>.
                </div>
              )}
            </section>

            {/* Development Responsibilities Breakdown */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Endrias */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-semibold text-white">Lead Developer: Endrias</h3>
                    <p className="text-xs text-sky-400">Platform Core, Multi-tenancy & Operations</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                    Developer A
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-sky-400">•</span> Architecture & Base Monorepo Environment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sky-400">•</span> Authentication & Session Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sky-400">•</span> Organizations & Multi-tenancy Isolation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sky-400">•</span> User Accounts, Roles & Granular RBAC
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sky-400">•</span> CRM (Customers, Contacts, Leads, Deals)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sky-400">•</span> Sales Orders & Invoicing Foundation
                  </li>
                </ul>
              </div>

              {/* Kenenisa */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-semibold text-white">Lead Developer: Kenenisa</h3>
                    <p className="text-xs text-emerald-400">Supply Chain & Operational Intelligence</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    Developer B (Active)
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">•</span> Product Catalog, Categories & UoM
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">•</span> Multi-Warehouse & Stock Movements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">•</span> Supplier Management & Vendor Directory
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">•</span> Purchase Requests & Purchase Orders
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">•</span> Goods Receiving & Inbound Logistics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">•</span> Notifications & Operational Dashboards
                  </li>
                </ul>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
