import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { POSTerminal } from '../pos/POSTerminal';
import { Dashboard } from '../dashboard/Dashboard';
import { ProductManagement } from '../products/ProductManagement';
import { InventoryManagement } from '../inventory/InventoryManagement';
import { ExpensesManagement } from '../expenses/ExpensesManagement';
import { CustomerManagement } from '../customers/CustomerManagement';
import { SupplierManagement } from '../suppliers/SupplierManagement';
import { ReportsView } from '../reports/ReportsView';
import { AuditLogsView } from '../audit/AuditLogsView';
import { SettingsView } from '../settings/SettingsView';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Package, 
  Layers, 
  Receipt, 
  Users, 
  Truck, 
  BarChart3, 
  History, 
  Clock, 
  RotateCcw, 
  Download,
  Settings,
  Store,
  LogOut,
  ShieldCheck,
  ShoppingCart,
  Database
} from 'lucide-react';

interface AdminPortalProps {
  onSwitchToUserPortal: () => void;
  onOpenShiftModal: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ 
  onSwitchToUserPortal, 
  onOpenShiftModal 
}) => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    logout, 
    cart, 
    currentShift, 
    pendingUsersCount,
    exportSystemData,
    resetToDefaults,
    isFirestoreSyncing
  } = useApp();

  // Tab state within the unified Admin Portal
  const [adminTab, setAdminTab] = useState<string>('pos');

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navTabs = [
    { id: 'pos', label: 'POS Terminal', icon: ShoppingBag },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Variants', icon: Package },
    { id: 'inventory', label: 'Inventory & Stock-In', icon: Layers },
    { id: 'expenses', label: 'Operating Expenses', icon: Receipt },
    { id: 'customers', label: 'Customers & CRM', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'settings', label: 'Setting', icon: Settings, badge: pendingUsersCount, adminOnly: true },
    { id: 'audit', label: 'Audit Logs', icon: History }
  ];

  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
      {/* UNIFIED ADMIN PORTAL HEADER */}
      <header className="sticky top-0 z-30 bg-stone-900 border-b border-stone-800 text-stone-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            
            {/* Left: Brand & Admin Portal Badge */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xl font-serif-luxury tracking-wide font-bold text-amber-100 whitespace-nowrap">
                HUELO PERFUMES
              </span>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full shadow-xs">
                ADMIN PORTAL
              </span>
            </div>

            {/* Center: Shift status drawer trigger */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onOpenShiftModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700/80 transition-colors whitespace-nowrap"
                title="Open Register Shift drawer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Shift: <strong className="font-semibold text-white">{currentShift.cashier}</strong></span>
                <span className="font-mono text-stone-400 text-[11px]">
                  (₱{currentShift.expectedCash.toLocaleString()})
                </span>
              </button>
            </div>

            {/* Right: Actions, Switch to User Portal, and Log Out */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Switch to User Portal Button */}
              <button
                onClick={onSwitchToUserPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-lg transition-colors whitespace-nowrap"
                title="Pumunta sa User Portal (Customer Boutique View)"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">User Portal</span>
              </button>

              {/* POS Cart Counter */}
              <button
                onClick={() => setAdminTab('pos')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap font-bold"
                title="Open POS Cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cart</span>
                <span className="font-mono bg-stone-900 text-amber-300 text-[11px] px-1.5 py-0.2 rounded font-bold">
                  {cartItemCount}
                </span>
              </button>

              {/* Authenticated Staff User Profile Badge */}
              <div className="flex items-center gap-2 bg-stone-800/90 px-2.5 py-1.5 rounded-lg border border-stone-700">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col text-left text-[11px] leading-tight">
                  <span className="text-stone-200 font-semibold truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-amber-400 text-[9px] uppercase font-mono font-bold">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Explicit Log Out button */}
              <button
                onClick={() => {
                  if (window.confirm('Sigurado ka bang nais mong mag-Log Out sa Admin Portal?')) {
                    logout();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 rounded-lg transition-colors whitespace-nowrap"
                title="Mag-Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* SINGLE UNIFIED ADMIN NAVIGATION BAR (Replaces the duplicate rows from the screenshots) */}
      <nav className="bg-stone-900/95 border-b border-stone-800 text-stone-300 text-xs no-print overflow-x-auto shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 shrink-0 overflow-x-auto py-0.5">
            {navTabs.map((tab) => {
              if (tab.adminOnly && !isAdminOrManager) return null;
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap shrink-0 relative ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Utility Tools: Backup & Reset */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={exportSystemData}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
              title="Download JSON Database Backup"
            >
              <Download className="w-3 h-3 text-stone-400" />
              <span>Backup</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('I-reset ang demo database sa default testing state?')) {
                  resetToDefaults();
                }
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-3 h-3 text-stone-500" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </nav>

      {/* ADMIN VIEWPORT CONTENT */}
      <main className="flex-1 pb-16">
        {adminTab === 'pos' && <POSTerminal />}
        {adminTab === 'dashboard' && <Dashboard />}
        {adminTab === 'products' && <ProductManagement />}
        {adminTab === 'inventory' && <InventoryManagement />}
        {adminTab === 'expenses' && <ExpensesManagement />}
        {adminTab === 'customers' && <CustomerManagement />}
        {adminTab === 'suppliers' && <SupplierManagement />}
        {adminTab === 'reports' && <ReportsView />}
        {adminTab === 'audit' && <AuditLogsView />}
        {adminTab === 'settings' && <SettingsView />}
      </main>

      {/* QUIET FOOTER */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-6 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury font-bold text-stone-200">HUELO PERFUMES</span>
            <span aria-hidden="true">·</span>
            <span>Admin &amp; Management Portal</span>
          </div>

          <div className="text-stone-400 text-right">
            <span>PHP (₱) Currency</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Authorized Staff Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
