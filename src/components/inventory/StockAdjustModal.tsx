import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerfumeProduct, PerfumeVariant, StockAdjustment } from '../../types';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StockAdjustModalProps {
  product?: PerfumeProduct;
  variant?: PerfumeVariant;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ product, variant, onClose }) => {
  const { products, adjustVariantStock } = useApp();

  const [selectedProdId, setSelectedProdId] = useState<string>(product?.id || products[0]?.id || '');
  const currentProd = products.find(p => p.id === selectedProdId) || products[0];

  const [selectedVarId, setSelectedVarId] = useState<string>(
    variant?.id || currentProd?.variants[0]?.id || ''
  );
  const currentVar = currentProd?.variants.find(v => v.id === selectedVarId) || currentProd?.variants[0];

  const [adjustType, setAdjustType] = useState<'set_exact' | 'delta'>('delta');
  const [deltaValue, setDeltaValue] = useState<number>(-1);
  const [exactValue, setExactValue] = useState<number>(currentVar?.stock || 0);
  const [reason, setReason] = useState<StockAdjustment['reason']>('Damaged bottle');
  const [notes, setNotes] = useState<string>('');

  const previousStock = currentVar?.stock || 0;
  const newStock = adjustType === 'set_exact' 
    ? Math.max(0, exactValue) 
    : Math.max(0, previousStock + deltaValue);
  const difference = newStock - previousStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProd || !currentVar) return;

    adjustVariantStock({
      productId: currentProd.id,
      variantId: currentVar.id,
      productName: currentProd.name,
      size: currentVar.size,
      previousStock,
      newStock,
      difference,
      reason,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-semibold text-stone-900 text-lg">Stock Adjustment</h3>
            <p className="text-xs text-stone-500">Log damage, tester sample allocation, spillage, or audit count</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Select Product & Variant */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Perfume *</label>
              <select
                value={selectedProdId}
                onChange={(e) => {
                  setSelectedProdId(e.target.value);
                  const p = products.find(x => x.id === e.target.value);
                  if (p && p.variants.length > 0) {
                    setSelectedVarId(p.variants[0].id);
                  }
                }}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Size Variant *</label>
              <select
                value={selectedVarId}
                onChange={(e) => setSelectedVarId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none"
              >
                {currentProd?.variants.map(v => (
                  <option key={v.id} value={v.id}>{v.size} ({v.stock} on-hand)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Reason for Adjustment *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as StockAdjustment['reason'])}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
            >
              <option value="Damaged bottle">Damaged bottle (Broken flacon / Defective sprayer)</option>
              <option value="Tester / Display bottle">Tester / Display bottle (Transferred to boutique counter)</option>
              <option value="Spillage during refill">Spillage during refill (Loss of oil &amp; alcohol)</option>
              <option value="Inventory count variance">Inventory count variance (Periodic stock-take audit)</option>
              <option value="Customer return to stock">Customer return to stock (Exchanged unopened bottle)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Adjustment values */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">Stock Calculation Mode</span>
              <div className="flex items-center bg-stone-200 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setAdjustType('delta')}
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    adjustType === 'delta' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  +/- Delta
                </button>
                <button
                  type="button"
                  onClick={() => { setAdjustType('set_exact'); setExactValue(previousStock); }}
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    adjustType === 'set_exact' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Set Exact
                </button>
              </div>
            </div>

            {adjustType === 'delta' ? (
              <div>
                <label className="block text-stone-600 mb-1">Change Quantity (+ to add, - to deduct)</label>
                <input
                  type="number"
                  value={deltaValue}
                  onChange={(e) => setDeltaValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono-numbers text-sm font-bold text-stone-900"
                />
              </div>
            ) : (
              <div>
                <label className="block text-stone-600 mb-1">New Audited Stock Count</label>
                <input
                  type="number"
                  min="0"
                  value={exactValue}
                  onChange={(e) => setExactValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono-numbers text-sm font-bold text-stone-900"
                />
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500">Previous: </span>
                <strong className="font-mono-numbers">{previousStock}</strong>
              </div>
              <div>
                <span className="text-stone-500">Difference: </span>
                <span className={`font-mono-numbers font-bold ${difference < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {difference > 0 ? `+${difference}` : difference}
                </span>
              </div>
              <div>
                <span className="text-stone-500">New Total: </span>
                <strong className="font-mono-numbers text-stone-900 text-sm">{newStock} bottles</strong>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-stone-600 mb-1">Specific Incident Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Broken nozzle discovered during unboxing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
