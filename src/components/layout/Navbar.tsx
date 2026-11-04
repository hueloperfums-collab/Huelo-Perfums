import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingCart } from 'lucide-react';

export const Navbar: React.FC<{ onOpenShiftModal: () => void }> = ({ onOpenShiftModal }) => {
  const { activeTab, setActiveTab, cart, currentShift, currentUser, users, switchUser } = useApp();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-stone-900 border-b border-stone-800 text-stone-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="text-xl font-serif-luxury tracking-wide font-semibold text-amber-100 hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            HUELO PERFUMES
          </button>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('pos')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'pos'
                  ? 'border-amber-400 text-amber-200'
                  : 'border-transparent text-stone-300 hover:text-white'
              }`}
            >
              POS Terminal
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-amber-400 text-amber-200'
                  : 'border-transparent text-stone-300 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-amber-400 text-amber-200'
                  : 'border-transparent text-stone-300 hover:text-white'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'inventory'
                  ? 'border-amber-400 text-amber-200'
                  : 'border-transparent text-stone-300 hover:text-white'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-amber-400 text-amber-200'
                  : 'border-transparent text-stone-300 hover:text-white'
              }`}
            >
              Reports &amp; P&amp;L
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Switch User & Role */}
            <div className="relative inline-block text-xs">
              <select
                aria-label="Active staff user role"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Cart button for mobile / top access */}
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 font-medium"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart</span>
              <span className="font-mono-numbers bg-stone-900 text-amber-300 text-[11px] px-1.5 py-0.2 rounded font-bold">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
