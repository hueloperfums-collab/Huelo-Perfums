import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { WorkspaceSubnav } from './components/layout/WorkspaceSubnav';
import { POSTerminal } from './components/pos/POSTerminal';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProductManagement } from './components/products/ProductManagement';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { ExpensesManagement } from './components/expenses/ExpensesManagement';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { SupplierManagement } from './components/suppliers/SupplierManagement';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SettingsView } from './components/settings/SettingsView';
import { UserPortal } from './components/portal/UserPortal';
import { RegisterShiftModal } from './components/shift/RegisterShiftModal';

function MainApp() {
  const { activeTab, currentUser } = useApp();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);

  // If active user is purely a customer user, show User Portal directly
  const isPureCustomer = currentUser.role === 'user';

  // Requirement 2: Strict separation of the Customer / User Portal from Staff Backoffice
  if (isPureCustomer) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
        <UserPortal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
      {/* 3-Zone Top Bar Contract */}
      <Navbar onOpenShiftModal={() => setIsShiftModalOpen(true)} />

      {/* Secondary Modular Workspace Subnav */}
      <WorkspaceSubnav onOpenShiftModal={() => setIsShiftModalOpen(true)} />

      {/* Active Tab Viewport Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'pos' && <POSTerminal />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'expenses' && <ExpensesManagement />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'suppliers' && <SupplierManagement />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'audit' && <AuditLogsView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'portal' && <UserPortal />}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-6 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury font-bold text-stone-200">HUELO PERFUMES</span>
            <span aria-hidden="true">·</span>
            <span>Perfume Point of Sale &amp; Inventory Management System</span>
          </div>

          <div className="text-stone-400 text-right">
            <span>Desktop, Tablet &amp; Mobile Responsive</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>PHP (₱) Currency</span>
          </div>
        </div>
      </footer>

      {/* Register Shift Modal */}
      {isShiftModalOpen && (
        <RegisterShiftModal onClose={() => setIsShiftModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
