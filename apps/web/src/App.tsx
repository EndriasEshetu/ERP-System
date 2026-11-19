import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApiResponse } from '@erp/shared';
import { CatalogView } from './modules/products/CatalogView.js';
import { InventoryView } from './modules/inventory/InventoryView.js';
import { ProcurementView } from './modules/procurement/ProcurementView.js';
import { OperationalDashboard } from './modules/dashboard/OperationalDashboard.js';
import { AuthProvider } from './context/AuthContext.js';
import { ProtectedRoute } from './routes/ProtectedRoute.js';
import { LoginPage } from './modules/auth/LoginPage.js';
import { RegisterPage } from './modules/auth/RegisterPage.js';
import { useAuth } from './hooks/useAuth.js';
import {
  Activity,
  Package,
  Server,
  Layers,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface HealthData {
  status: 'UP' | 'DOWN';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: 'CONNECTED' | 'DISCONNECTED';
}

type TabType = 'dashboard' | 'catalog' | 'inventory' | 'procurement' | 'health';

function ERPPlatform() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<TabType>('dashboard');

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/v1/health', {
        credentials: 'include',
      });
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
              <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider border border-emerald-500/20">
                Commercial Core
              </span>
              <span className="text-xs text-slate-400">Milestone 2 • Authenticated Session Active</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
              ERP System Platform
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Modular Monolith ERP • Multi-tenant by design • Full-Stack Operational Suite
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Authenticated User Badge */}
            {user && (
              <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left text-xs pr-1">
                  <span className="block font-semibold text-white leading-tight">{user.name}</span>
                  <span className="block text-[11px] text-slate-400 leading-tight">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

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
        <nav className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setMainTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              mainTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & KPIs</span>
          </button>

          <button
            onClick={() => setMainTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              mainTab === 'catalog'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalog (Products, UoM, Categories)</span>
          </button>

          <button
            onClick={() => setMainTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              mainTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Warehouses & Stock Ledger</span>
          </button>

          <button
            onClick={() => setMainTab('procurement')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              mainTab === 'procurement'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Procurement & Goods Receiving</span>
          </button>

          <button
            onClick={() => setMainTab('health')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              mainTab === 'health'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>System Health & Overview</span>
          </button>
        </nav>

        {/* TAB 1: OPERATIONAL DASHBOARD */}
        {mainTab === 'dashboard' && (
          <section className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-6">
            <OperationalDashboard />
          </section>
        )}

        {/* TAB 2: PRODUCT CATALOG */}
        {mainTab === 'catalog' && (
          <section className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-6">
            <CatalogView />
          </section>
        )}

        {/* TAB 3: WAREHOUSES & INVENTORY */}
        {mainTab === 'inventory' && (
          <section className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-6">
            <InventoryView />
          </section>
        )}

        {/* TAB 4: PROCUREMENT & GOODS RECEIVING */}
        {mainTab === 'procurement' && (
          <section className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-6">
            <ProcurementView />
          </section>
        )}

        {/* TAB 5: SYSTEM HEALTH & ARCHITECTURE OVERVIEW */}
        {mainTab === 'health' && (
          <div className="space-y-8">
            <section className="bg-slate-800/60 border border-slate-800 rounded-xl p-6 backdrop-blur">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
                <span>Live System Health & Connectivity</span>
                {loading && <span className="text-xs text-slate-400 animate-pulse">Checking status...</span>}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-medium">Frontend Client</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-base font-semibold text-white">ONLINE</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">React 18 • Vite 6 • Tailwind</p>
                </div>

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
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ERPPlatform />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
