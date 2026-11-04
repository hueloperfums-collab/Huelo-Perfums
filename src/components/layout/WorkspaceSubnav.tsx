import React from 'react';
import { useApp } from '../../context/AppContext';
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
  Database,
  Settings,
  Store,
  LogIn,
  LogOut
} from 'lucide-react';

export const WorkspaceSubnav: React.FC<{ onOpenShiftModal: () => void }> = ({ onOpenShiftModal }) => {
  const { 
    activeTab, 
    setActiveTab, 
    currentShift, 
    exportSystemData, 
    resetToDefaults, 
    isFirestoreSyncing,
    firebaseUser,
    loginGoogle,
    logoutGoogle,
    currentUser,
    pendingUsersCount
  } = useApp();

  const tabs = [
    { id: 'pos', label: 'POS Terminal', icon: ShoppingBag },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Variants', icon: Package },
    { id: 'inventory', label: 'Inventory & Stock-In', icon: Layers },
    { id: 'expenses', label: 'Operating Expenses', icon: Receipt },
    { id: 'customers', label: 'Customers & Loyalty', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'settings', label: 'Setting', icon: Settings, badge: pendingUsersCount, adminOnly: true },
    { id: 'portal', label: 'User Portal', icon: Store },
  ];

  return (
    <div className="bg-stone-100 border-b border-stone-200 text-stone-700 text-xs no-print overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        {/* Subnav links */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-0.5">
          {tabs.map((tab) => {
            if (tab.adminOnly && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
              return null;
            }
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'bg-stone-900 text-amber-300 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Shift status, Firestore indicator & utility actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-[11px] text-stone-600 bg-stone-200/60 rounded">
            <Database className="w-3 h-3 text-amber-700" />
            <span>{isFirestoreSyncing ? 'Syncing...' : 'Firestore Live'}</span>
          </div>

          {firebaseUser ? (
            <button
              onClick={logoutGoogle}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-700 bg-stone-200 hover:bg-stone-300 rounded transition-colors"
              title={`Logged in as ${firebaseUser.email}`}
            >
              <LogOut className="w-3 h-3 text-stone-500" />
              <span>{firebaseUser.email?.split('@')[0]}</span>
              <span className="text-stone-400">·</span>
              <span className="text-[10px] text-stone-600 font-semibold">Log Out</span>
            </button>
          ) : (
            <button
              onClick={loginGoogle}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs text-amber-900 bg-amber-200 hover:bg-amber-300 rounded font-semibold transition-colors"
              title="Mag-Log In gamit ang iyong account"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
          <button
            onClick={onOpenShiftModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors whitespace-nowrap"
            title="Register Shift Drawer"
          >
            <Clock className="w-3.5 h-3.5 text-stone-600" />
            <span>Shift: <strong className="font-semibold">{currentShift.cashier}</strong></span>
            <span className="font-mono-numbers text-stone-500">
              (₱{currentShift.expectedCash.toLocaleString()})
            </span>
          </button>

          <button
            onClick={exportSystemData}
            className="flex items-center gap-1 px-2 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
            title="Download JSON Backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset demo data to default test dataset? Current changes will be restored.')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded transition-colors"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
