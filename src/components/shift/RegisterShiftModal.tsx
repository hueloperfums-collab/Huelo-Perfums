import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Banknote, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface RegisterShiftModalProps {
  onClose: () => void;
}

export const RegisterShiftModal: React.FC<RegisterShiftModalProps> = ({ onClose }) => {
  const { currentShift, closeShift, openNewShift, currentUser } = useApp();

  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [newCashier, setNewCashier] = useState<string>(currentUser.name);
  const [newOpeningFloat, setNewOpeningFloat] = useState<string>('3000');

  const actualCash = parseFloat(actualCashInput) || 0;
  const discrepancy = actualCash - currentShift.expectedCash;

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeShift(actualCash, closingNotes.trim());
  };

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    openNewShift(newCashier.trim() || currentUser.name, parseFloat(newOpeningFloat) || 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-semibold text-stone-900 text-lg">Cash Register Drawer &amp; Shift</h3>
            <p className="text-xs text-stone-500">Reconcile physical cash drawer with POS recorded totals</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentShift.status === 'open' ? (
          <div className="space-y-4 text-xs">
            {/* Shift In-Progress Summary */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2.5">
              <div className="flex justify-between items-center text-stone-600">
                <span>Active Shift Cashier:</span>
                <strong className="text-stone-900 font-bold">{currentShift.cashier}</strong>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Shift Started At:</span>
                <span className="font-mono-numbers">{new Date(currentShift.openedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Opening Cash Float:</span>
                <span className="font-mono-numbers font-semibold">₱{currentShift.openingFloat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Cash Sales Recorded:</span>
                <span className="font-mono-numbers text-emerald-700 font-semibold">+₱{currentShift.cashSales.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                <span className="font-bold text-stone-900 text-sm">Expected Cash In Drawer:</span>
                <span className="font-bold font-mono-numbers text-stone-900 text-base">
                  ₱{currentShift.expectedCash.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Other Channel Sales Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-blue-800 font-medium">GCash Recorded</div>
                <div className="font-bold font-mono-numbers text-blue-950 text-sm mt-0.5">
                  ₱{currentShift.gcashSales.toFixed(2)}
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="text-purple-800 font-medium">Card POS Recorded</div>
                <div className="font-bold font-mono-numbers text-purple-950 text-sm mt-0.5">
                  ₱{currentShift.cardSales.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Closing Form */}
            <form onSubmit={handleCloseShift} className="space-y-3 pt-2">
              <div className="font-semibold text-stone-900">Close Cashier Shift</div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Actual Physical Cash Counted (₱) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Count physical bills and coins..."
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono-numbers text-base font-bold text-stone-900 focus:outline-none"
                />
              </div>

              {actualCashInput && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  discrepancy === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  discrepancy > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <span>Discrepancy (Over / Short):</span>
                  <span className="font-mono-numbers text-sm font-bold">
                    {discrepancy >= 0 ? `+₱${discrepancy.toFixed(2)} (Overage)` : `-₱${Math.abs(discrepancy).toFixed(2)} (Shortage)`}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-stone-600 mb-1">Closing Register Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. End of day shift closing; float retained in register safe"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!actualCashInput}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl disabled:opacity-50"
                >
                  Confirm &amp; Close Shift
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Shift is Closed - Option to Open New Shift */
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Last Register Shift is Closed</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Closed by {currentShift.cashier} at {currentShift.closedAt ? new Date(currentShift.closedAt).toLocaleTimeString() : ''}.
                Discrepancy: ₱{currentShift.discrepancy?.toFixed(2) || '0.00'}.
              </p>
            </div>

            <form onSubmit={handleOpenShift} className="space-y-3">
              <div className="font-semibold text-stone-900">Open New Cashier Shift</div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Assigned Cashier</label>
                <input
                  type="text"
                  required
                  value={newCashier}
                  onChange={(e) => setNewCashier(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Opening Change Float (₱)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newOpeningFloat}
                  onChange={(e) => setNewOpeningFloat(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono-numbers font-bold text-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl"
                >
                  Start New Register Shift
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
