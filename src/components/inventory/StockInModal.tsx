import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder, PurchaseOrderItem, PerfumeSize } from '../../types';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface StockInModalProps {
  onClose: () => void;
}

export const StockInModal: React.FC<StockInModalProps> = ({ onClose }) => {
  const { suppliers, products, processStockIn } = useApp();

  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poNumber, setPoNumber] = useState<string>(
    `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [notes, setNotes] = useState<string>('');

  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      productId: products[0]?.id || '',
      variantId: products[0]?.variants[1]?.id || products[0]?.variants[0]?.id || '',
      productName: products[0]?.name || '',
      size: '30ml',
      quantity: 20,
      unitCost: products[0]?.variants[1]?.costPrice || 120,
      batchNumber: `BAT-${new Date().getFullYear()}-01`,
      expiryDate: '2029-12-31'
    }
  ]);

  const selectedSupplier = suppliers.find(s => s.id === supplierId) || suppliers[0];

  const handleAddItem = () => {
    const prod = products[0];
    const v = prod.variants[0];
    setItems(prev => [
      ...prev,
      {
        productId: prod.id,
        variantId: v.id,
        productName: prod.name,
        size: v.size,
        quantity: 10,
        unitCost: v.costPrice,
        batchNumber: `BAT-${new Date().getFullYear()}-02`
      }
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        if (prod) {
          const v = prod.variants[0];
          next[index] = {
            ...next[index],
            productId: prod.id,
            productName: prod.name,
            variantId: v.id,
            size: v.size,
            unitCost: v.costPrice
          };
        }
      } else if (field === 'variantId') {
        const prod = products.find(p => p.id === next[index].productId);
        const v = prod?.variants.find(varItem => varItem.id === value);
        if (v) {
          next[index] = {
            ...next[index],
            variantId: v.id,
            size: v.size,
            unitCost: v.costPrice
          };
        }
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    processStockIn({
      poNumber: poNumber.trim(),
      supplierId,
      supplierName: selectedSupplier?.name || 'Supplier',
      items,
      totalAmount,
      status: 'received',
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-semibold text-stone-900 text-lg">Receive Stock-In Delivery</h3>
            <p className="text-xs text-stone-500">Log incoming fragrance inventory from supplier</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Supplier & PO Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">PO / Supplier Invoice # *</label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono-numbers text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Items to receive list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-900 text-sm">Bottles &amp; Variants Received</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 text-xs text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-md font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
                  <tr>
                    <th className="p-2.5 font-medium">Perfume Product</th>
                    <th className="p-2.5 font-medium">Size</th>
                    <th className="p-2.5 font-medium">Quantity</th>
                    <th className="p-2.5 font-medium">Unit Cost (₱)</th>
                    <th className="p-2.5 font-medium">Subtotal</th>
                    <th className="p-2.5 font-medium">Batch #</th>
                    <th className="p-2.5 font-medium text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {items.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId) || products[0];
                    const itemSubtotal = item.quantity * item.unitCost;

                    return (
                      <tr key={idx}>
                        <td className="p-2">
                          <select
                            value={item.productId}
                            onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                            className="w-48 bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2">
                          <select
                            value={item.variantId}
                            onChange={(e) => handleUpdateItem(idx, 'variantId', e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs font-semibold"
                          >
                            {prod.variants.map(v => (
                              <option key={v.id} value={v.id}>{v.size}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 bg-stone-50 border border-stone-200 rounded px-2 py-1 font-mono-numbers font-semibold"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                            className="w-20 bg-stone-50 border border-stone-200 rounded px-2 py-1 font-mono-numbers"
                          />
                        </td>

                        <td className="p-2 font-mono-numbers font-bold text-stone-900">
                          ₱{itemSubtotal.toFixed(2)}
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Batch"
                            value={item.batchNumber || ''}
                            onChange={(e) => handleUpdateItem(idx, 'batchNumber', e.target.value)}
                            className="w-24 bg-stone-50 border border-stone-200 rounded px-2 py-1 font-mono-numbers text-[11px]"
                          />
                        </td>

                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Summary Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Optional delivery notes (e.g. Courier: Lalamove, Checked by Marcus)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
              />
            </div>
            <div className="text-right shrink-0">
              <span className="text-stone-500 text-xs mr-2">Total PO Value:</span>
              <span className="text-xl font-bold font-mono-numbers text-stone-900">
                ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
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
              className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Stock-In &amp; Update Inventory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
