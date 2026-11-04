import React, { useState } from 'react';
import { SaleTransaction } from '../../types';
import { Printer, Check, Copy, X } from 'lucide-react';

interface ThermalReceiptProps {
  sale: SaleTransaction;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ sale, onClose }) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [copied, setCopied] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
AURA FRAGRANCES BOUTIQUE
Invoice: ${sale.invoiceNumber}
Date: ${new Date(sale.timestamp).toLocaleString()}
Cashier: ${sale.cashierName}
--------------------------------
${sale.items.map(i => `${i.productName} (${i.size}) x${i.quantity} = ₱${i.lineTotal.toFixed(2)}`).join('\n')}
--------------------------------
Subtotal: ₱${sale.subtotal.toFixed(2)}
Discount: -₱${sale.discountAmount.toFixed(2)}
TOTAL: ₱${sale.total.toFixed(2)}
Payment: ${sale.paymentMethod.toUpperCase()}
Thank you for shopping at Aura Fragrances!
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-100 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-700">Receipt Format:</span>
            <div className="flex items-center bg-stone-200 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  paperWidth === '58mm' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                58mm Roll
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  paperWidth === '80mm' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                80mm Roll
              </button>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE THERMAL RECEIPT CONTAINER */}
        <div className="flex justify-center overflow-x-auto py-2">
          <div 
            className={`printable-receipt-area bg-white text-black p-5 shadow-sm border border-stone-200 text-left font-mono-numbers ${
              paperWidth === '58mm' ? 'w-[260px] text-[11px]' : 'w-[340px] text-[12px]'
            }`}
            style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
          >
            {/* Store Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-400">
              <div className="text-sm font-bold tracking-wider font-serif-luxury uppercase">
                AURA FRAGRANCES
              </div>
              <div className="text-[10px] text-stone-600">
                Luxury &amp; Inspired Artisanal Perfumes
              </div>
              <div className="text-[9px] text-stone-500">
                Boutique Mall Branch, Metro Manila<br />
                TIN: 482-901-229-000 | Contact: 0917-884-2190
              </div>
            </div>

            {/* Transaction Metadata */}
            <div className="py-2.5 text-[10px] space-y-0.5 border-b border-dashed border-stone-400">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{new Date(sale.timestamp).toLocaleDateString()} {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{sale.cashierName}</span>
              </div>
              {sale.customer && (
                <div className="flex justify-between pt-0.5 text-stone-800">
                  <span>CUSTOMER:</span>
                  <span className="font-semibold truncate max-w-[140px]">{sale.customer.name}</span>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="py-2.5 border-b border-dashed border-stone-400 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-stone-700">
                <span>ITEM &amp; SIZE</span>
                <span>TOTAL (₱)</span>
              </div>

              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-stone-900 leading-tight">
                    {item.productName}
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-600">
                    <span>{item.size} · {item.quantity}x @ ₱{item.unitPrice.toFixed(2)}</span>
                    <span className="font-semibold text-stone-900">₱{item.lineTotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Totals */}
            <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-stone-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱{sale.subtotal.toFixed(2)}</span>
              </div>

              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-stone-800">
                  <span>Discount ({sale.discountType}):</span>
                  <span>-₱{sale.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm pt-1 border-t border-stone-200">
                <span>TOTAL DUE:</span>
                <span>₱{sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 space-y-1 text-[10px] border-b border-dashed border-stone-400">
              <div className="flex justify-between font-semibold">
                <span>PAYMENT METHOD:</span>
                <span>{sale.paymentMethod.toUpperCase()}</span>
              </div>

              {sale.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>₱{(sale.paymentDetails.cashReceived || sale.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change Returned:</span>
                    <span>₱{(sale.paymentDetails.changeGiven || 0).toFixed(2)}</span>
                  </div>
                </>
              )}

              {sale.paymentMethod === 'gcash' && (
                <div className="flex justify-between">
                  <span>GCash Ref No:</span>
                  <span className="font-bold">{sale.paymentDetails.gcashRef || 'Verified'}</span>
                </div>
              )}

              {sale.paymentMethod === 'card' && (
                <div className="flex justify-between">
                  <span>Card Approval:</span>
                  <span className="font-bold">{sale.paymentDetails.cardRef}</span>
                </div>
              )}

              {sale.paymentMethod === 'split' && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Portion:</span>
                    <span>₱{(sale.paymentDetails.splitCash || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GCash Portion:</span>
                    <span>₱{(sale.paymentDetails.splitGcash || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Loyalty Points summary */}
            {sale.customer && (
              <div className="py-2 text-[10px] border-b border-dashed border-stone-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Points Earned Today:</span>
                  <span className="font-bold">+{sale.customer.pointsEarned} pts</span>
                </div>
                {sale.customer.pointsRedeemed > 0 && (
                  <div className="flex justify-between">
                    <span>Points Redeemed:</span>
                    <span>-{sale.customer.pointsRedeemed} pts</span>
                  </div>
                )}
              </div>
            )}

            {/* Simulated Barcode */}
            <div className="pt-3 text-center space-y-1">
              <div className="inline-block py-1 tracking-[4px] font-bold text-xs bg-stone-100 px-3 border border-stone-300">
                |||| | ||||| || |||||| | ||||
              </div>
              <div className="text-[9px] text-stone-500 font-mono-numbers">
                {sale.invoiceNumber}
              </div>
            </div>

            {/* Footer / Return Policy */}
            <div className="pt-3 text-center text-[9px] text-stone-500 space-y-0.5">
              <p className="font-semibold text-stone-800">Thank you for your scent patronage!</p>
              <p>Keep this receipt for returns or exchanges within 7 days.</p>
              <p>Follow us @AuraFragrances.ph</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Thermal Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg transition-colors"
            >
              Next Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
