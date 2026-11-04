import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, SaleTransaction } from '../../types';
import { 
  Banknote, 
  Smartphone, 
  CreditCard, 
  Split, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: (sale: SaleTransaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { cartTotal, completeSale } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [gcashRef, setGcashRef] = useState<string>('');
  const [cardRef, setCardRef] = useState<string>('');
  
  // Split payment state
  const [splitCash, setSplitCash] = useState<string>('');
  const [splitGcash, setSplitGcash] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cashNum = parseFloat(cashReceived) || 0;
  const changeGiven = Math.max(0, cashNum - cartTotal);

  const splitCashNum = parseFloat(splitCash) || 0;
  const splitGcashNum = parseFloat(splitGcash) || 0;
  const splitTotal = splitCashNum + splitGcashNum;
  const splitRemaining = cartTotal - splitTotal;

  // Fast cash presets
  const handlePreset = (amount: number) => {
    setCashReceived((prev) => {
      const current = parseFloat(prev) || 0;
      return (current + amount).toString();
    });
  };

  const handleExactCash = () => {
    setCashReceived(cartTotal.toString());
  };

  const handleConfirm = () => {
    setErrorMsg(null);

    if (paymentMethod === 'cash') {
      if (cashNum < cartTotal) {
        setErrorMsg(`Cash received (₱${cashNum.toFixed(2)}) is less than total amount (₱${cartTotal.toFixed(2)}).`);
        return;
      }
      const sale = completeSale('cash', {
        cashReceived: cashNum,
        changeGiven
      }, notes);
      if (sale) onSuccess(sale);
    } else if (paymentMethod === 'gcash') {
      if (!gcashRef.trim()) {
        setErrorMsg('Please input the GCash 9-13 digit transaction reference number.');
        return;
      }
      const sale = completeSale('gcash', {
        gcashRef: gcashRef.trim()
      }, notes);
      if (sale) onSuccess(sale);
    } else if (paymentMethod === 'card') {
      if (!cardRef.trim()) {
        setErrorMsg('Please enter the POS terminal card reference or authorization code.');
        return;
      }
      const sale = completeSale('card', {
        cardRef: cardRef.trim()
      }, notes);
      if (sale) onSuccess(sale);
    } else if (paymentMethod === 'split') {
      if (Math.abs(splitRemaining) > 0.01) {
        setErrorMsg(`Split payment sum (₱${splitTotal.toFixed(2)}) must equal the order total (₱${cartTotal.toFixed(2)}).`);
        return;
      }
      const sale = completeSale('split', {
        splitCash: splitCashNum,
        splitGcash: splitGcashNum,
        gcashRef: gcashRef.trim() || undefined
      }, notes);
      if (sale) onSuccess(sale);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-semibold text-stone-900 text-lg">Checkout &amp; Payment</h3>
            <p className="text-xs text-stone-500">Select payment channel and record customer receipt</p>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount to Pay Banner */}
        <div className="bg-stone-900 text-amber-300 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-stone-400 text-xs uppercase tracking-wider">Amount Due</div>
            <div className="text-2xl font-bold font-mono-numbers">
              ₱{cartTotal.toFixed(2)}
            </div>
          </div>
          <div className="text-right text-xs text-stone-400 font-mono-numbers">
            <div>Philippine Peso (PHP)</div>
            <div className="text-stone-300 font-medium">VAT Inclusive</div>
          </div>
        </div>

        {/* Payment Methods Selector Tabs */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => { setPaymentMethod('cash'); setErrorMsg(null); }}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
              paymentMethod === 'cash'
                ? 'bg-amber-50 border-amber-500 text-stone-950 ring-1 ring-amber-500'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Banknote className="w-5 h-5 text-emerald-600" />
            <span>Cash</span>
          </button>

          <button
            type="button"
            onClick={() => { setPaymentMethod('gcash'); setErrorMsg(null); }}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
              paymentMethod === 'gcash'
                ? 'bg-blue-50 border-blue-500 text-stone-950 ring-1 ring-blue-500'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Smartphone className="w-5 h-5 text-blue-600" />
            <span>GCash</span>
          </button>

          <button
            type="button"
            onClick={() => { setPaymentMethod('card'); setErrorMsg(null); }}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
              paymentMethod === 'card'
                ? 'bg-purple-50 border-purple-500 text-stone-950 ring-1 ring-purple-500'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <CreditCard className="w-5 h-5 text-purple-600" />
            <span>Card POS</span>
          </button>

          <button
            type="button"
            onClick={() => { setPaymentMethod('split'); setErrorMsg(null); }}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
              paymentMethod === 'split'
                ? 'bg-stone-100 border-stone-800 text-stone-950 ring-1 ring-stone-800'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Split className="w-5 h-5 text-stone-700" />
            <span>Split</span>
          </button>
        </div>

        {/* Dynamic Payment Detail Inputs */}
        <div className="space-y-3">
          {paymentMethod === 'cash' && (
            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Cash Tendered (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">₱</span>
                  <input
                    type="number"
                    autoFocus
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-stone-200 rounded-lg text-lg font-bold font-mono-numbers text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Fast Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={handleExactCash}
                  className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-semibold text-xs"
                >
                  Exact (₱{cartTotal.toFixed(0)})
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(100)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 rounded-md font-mono-numbers"
                >
                  +₱100
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(200)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 rounded-md font-mono-numbers"
                >
                  +₱200
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(500)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 rounded-md font-mono-numbers"
                >
                  +₱500
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(1000)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 rounded-md font-mono-numbers"
                >
                  +₱1,000
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived('')}
                  className="px-2 py-1.5 text-stone-400 hover:text-stone-700 ml-auto"
                >
                  Reset
                </button>
              </div>

              {/* Real-time Change Indicator */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <span className="font-semibold text-stone-700 text-sm">Change to Return:</span>
                <span className={`text-xl font-bold font-mono-numbers ${
                  cashNum >= cartTotal ? 'text-emerald-700' : 'text-stone-400'
                }`}>
                  ₱{changeGiven.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'gcash' && (
            <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-medium">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>GCash Merchant / QRPH Transfer</span>
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  GCash Reference Number * (e.g. 9-13 digit reference)
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. GC-8829104812"
                  value={gcashRef}
                  onChange={(e) => setGcashRef(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-mono-numbers text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-blue-700">
                Verify customer screen shows ₱{cartTotal.toFixed(2)} received before completing.
              </p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200 text-xs">
              <div className="flex items-center gap-2 text-purple-900 font-medium">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Debit / Credit Card (Maya / BDO / BPI Terminal)</span>
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Terminal Approval / Trace Number *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. VISA-APP-994182"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm font-mono-numbers text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'split' && (
            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div className="font-semibold text-stone-800">Split Payment (Cash + GCash)</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Cash Portion (₱)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={splitCash}
                    onChange={(e) => setSplitCash(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm font-mono-numbers text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">GCash Portion (₱)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={splitGcash}
                    onChange={(e) => setSplitGcash(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm font-mono-numbers text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1">GCash Reference No.</label>
                <input
                  type="text"
                  placeholder="Optional reference"
                  value={gcashRef}
                  onChange={(e) => setGcashRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono-numbers"
                />
              </div>

              <div className="flex justify-between text-xs pt-1 border-t border-stone-200">
                <span>Split Total: <strong className="font-mono-numbers">₱{splitTotal.toFixed(2)}</strong></span>
                <span className={Math.abs(splitRemaining) < 0.01 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                  {Math.abs(splitRemaining) < 0.01 ? 'Balanced ✓' : `Remaining: ₱${splitRemaining.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}

          {/* Optional order notes */}
          <div>
            <label className="block text-stone-500 text-xs mb-1">Internal Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Gift wrapped, 2 sprayers requested..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 text-xs font-medium hover:bg-stone-50 transition-colors"
          >
            Back to Cart
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Confirm &amp; Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
