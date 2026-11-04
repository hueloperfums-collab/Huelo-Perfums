import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminPortal } from './components/admin/AdminPortal';
import { UserPortal } from './components/portal/UserPortal';
import { LandingPage } from './components/landing/LandingPage';
import { RegisterShiftModal } from './components/shift/RegisterShiftModal';

function MainApp() {
  const { currentUser, isLoggedIn, isAuthChecking } = useApp();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [activePortal, setActivePortal] = useState<'admin' | 'user'>('admin');

  // Loading state habang sinusuri kung may aktibong account sa Firebase
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-amber-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-serif-luxury font-bold text-2xl text-amber-300 animate-pulse shadow-xl">
          HP
        </div>
        <div className="mt-4 font-serif-luxury tracking-widest text-sm text-stone-300 uppercase">
          HUELO PERFUMES
        </div>
      </div>
    );
  }

  // 1. Kapag binuksan ang link at WALA PANG ACCOUNT / hindi pa naka-login:
  // Mapupunta muna ang user sa registration page
  if (!isLoggedIn) {
    return <LandingPage />;
  }

  // 2. NGUNIT KUNG MAY ACCOUNT NA SA SYSTEM (naka-login):
  // Direktang mapupunta ang user sa kanyang sariling portal!
  
  // A. Kung Customer / User ang role -> DIREKTA SA USER PORTAL
  const isCustomer = currentUser.role === 'user';
  if (isCustomer) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
        <UserPortal />
      </div>
    );
  }

  // B. Kung Admin / Staff ang role (e.g. hueloperfums@gmail.com):
  // May kakayahan si Admin na mag-preview sa User Portal kung nais
  if (activePortal === 'user') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
        <UserPortal onSwitchToAdmin={() => setActivePortal('admin')} />
      </div>
    );
  }

  // DIREKTA SA ADMIN PORTAL para kay Admin / Staff
  return (
    <>
      <AdminPortal 
        onSwitchToUserPortal={() => setActivePortal('user')}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
      />

      {/* Register Shift Drawer Modal */}
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
