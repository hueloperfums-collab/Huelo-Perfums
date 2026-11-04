import React from 'react';
import { PerfumeProduct, PerfumeVariant } from '../../types';
import { Printer, X } from 'lucide-react';

interface BarcodePrintModalProps {
  product: PerfumeProduct;
  variant?: PerfumeVariant;
  onClose: () => void;
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({ product, variant, onClose }) => {
  const variantsToPrint = variant ? [variant] : product.variants;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 no-print">
          <div>
            <h3 className="font-semibold text-stone-900 text-base">Print Perfume Bottle Barcode Labels</h3>
            <p className="text-xs text-stone-500">Adhesive sticker format for {product.name}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Sheet */}
        <div className="printable-receipt-area p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {variantsToPrint.map((v) => (
              <div 
                key={v.id} 
                className="bg-white border-2 border-stone-800 p-3 rounded-md text-center space-y-1 shadow-xs"
              >
                <div className="text-[9px] uppercase tracking-wider text-stone-500 font-bold">
                  HUELO PERFUMES
                </div>
                <div className="font-bold text-xs text-stone-900 truncate">
                  {product.name}
                </div>
                <div className="text-[11px] font-semibold text-stone-700">
                  {v.size} · ₱{v.sellingPrice.toFixed(2)}
                </div>
                {/* Barcode representation */}
                <div className="pt-1">
                  <div className="inline-block py-0.5 tracking-[3px] text-xs font-mono font-bold">
                    ||| | |||| | ||| ||
                  </div>
                  <div className="text-[9px] font-mono-numbers text-stone-600">
                    {v.barcode}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 text-xs font-medium hover:bg-stone-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
