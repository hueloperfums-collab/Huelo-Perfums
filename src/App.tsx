import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminPortal } from './components/admin/AdminPortal';
import { UserPortal } from './components/portal/UserPortal';
import { LandingPage } from './components/landing/LandingPage';
import { RegisterShiftModal } from './components/shift/RegisterShiftModal';

function MainApp() {
  const { currentUser, isLoggedIn } = useApp();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [activePortal, setActivePortal] = useState<'admin' | 'user'>('admin');
  const [showGuestStore, setShowGuestStore] = useState<boolean>(false);

  // 1. If user is not logged in:
  if (!isLoggedIn) {
    if (showGuestStore) {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
          <UserPortal 
            onBackToLanding={() => setShowGuestStore(false)} 
            onSwitchToAdmin={() => setActivePortal('admin')}
          />
        </div>
      );
    }
    return (
      <LandingPage 
        onBrowseStore={() => setShowGuestStore(true)} 
        onOpenAdminPortal={() => setActivePortal('admin')}
      />
    );
  }

  // 2. If logged in as regular customer / user:
  // Strictly isolated to the dedicated User Portal (cannot access Admin Portal)
  const isCustomer = currentUser.role === 'user';
  if (isCustomer) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
        <UserPortal />
      </div>
    );
  }

  // 3. If staff or admin and currently previewing the User Portal:
  if (activePortal === 'user') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
        <UserPortal onSwitchToAdmin={() => setActivePortal('admin')} />
      </div>
    );
  }

  // 4. Dedicated Admin Portal (Unified, professional layout with zero duplicate navigation bars)
  return (
    <>
      <AdminPortal 
        onSwitchToUserPortal={() => setActivePortal('user')}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
      />

      {/* Register Shift Modal */}
      {isShiftModalOpen && (
        <RegisterShiftModal onClose={() => setIsShiftModalOpen(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
