import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  PlusCircle, 
  ArrowUpRight, 
  Layers, 
  Smartphone, 
  Banknote, 
  CreditCard,
  Receipt,
  Printer
} from 'lucide-react';
import { ThermalReceipt } from '../pos/ThermalReceipt';
import { SaleTransaction } from '../../types';

export const Dashboard: React.FC<{ onOpenStockIn?: () => void }> = ({ onOpenStockIn }) => {
  const { products, sales, expenses, setActiveTab } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState<SaleTransaction | null>(null);

  // Today's date filter (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysSalesList = sales.filter(s => s.timestamp.startsWith(todayStr) && s.status === 'completed');

  const todaySalesTotal = todaysSalesList.reduce((acc, s) => acc + s.total, 0);
  const todayCostTotal = todaysSalesList.reduce((acc, s) => acc + s.totalCost, 0);
  const todayGrossProfit = todaySalesTotal - todayCostTotal;
  const todayProfitMargin = todaySalesTotal > 0 ? (todayGrossProfit / todaySalesTotal) * 100 : 0;

  // Total products & variants count
  const totalVariantsCount = products.reduce((acc, p) => acc + p.variants.length, 0);

  // Low stock variants (stock <= reorderLevel)
  const lowStockItems = products.flatMap(p => 
    p.variants
      .filter(v => v.stock <= v.reorderLevel)
      .map(v => ({
        productId: p.id,
        productName: p.name,
        brand: p.brand,
        size: v.size,
        stock: v.stock,
        reorderLevel: v.reorderLevel,
        costPrice: v.costPrice,
        sellingPrice: v.sellingPrice
      }))
  );

  // Payment Breakdown for today
  const cashSalesToday = todaysSalesList.reduce((acc, s) => {
    if (s.paymentMethod === 'cash') return acc + s.total;
    if (s.paymentMethod === 'split') return acc + (s.paymentDetails.splitCash || 0);
    return acc;
  }, 0);

  const gcashSalesToday = todaysSalesList.reduce((acc, s) => {
    if (s.paymentMethod === 'gcash') return acc + s.total;
    if (s.paymentMethod === 'split') return acc + (s.paymentDetails.splitGcash || 0);
    return acc;
  }, 0);

  const cardSalesToday = todaysSalesList.reduce((acc, s) => {
    if (s.paymentMethod === 'card') return acc + s.total;
    return acc;
  }, 0);

  // Recent transactions (last 5)
  const recentSales = sales.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-amber-700">
            Aura Perfumes Point of Sale
          </div>
          <h1 className="text-2xl font-bold font-serif-luxury text-stone-900 mt-1">
            Store Performance Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time daily sales, product costing, variants, and profit analytics
          </p>
        </div>

        {/* Quick launch action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Cashier</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>Stock-In Supplies</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS (Exact match to specification figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-stone-900">
            ₱{todaySalesTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{todaysSalesList.length} completed orders today</span>
          </div>
        </div>

        {/* Card 2: Today's Profit */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Today's Profit
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-stone-900">
            ₱{todayGrossProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            Gross Margin: <strong className="font-semibold text-amber-800">{todayProfitMargin.toFixed(1)}%</strong>
          </div>
        </div>

        {/* Card 3: Total Products */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-stone-900">
            {totalVariantsCount}
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            Across {products.length} perfume fragrance lines
          </div>
        </div>

        {/* Card 4: Low Stock Items */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Low Stock Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-rose-600">
            {lowStockItems.length}
          </div>
          <div className="text-[11px] text-rose-700 font-medium">
            Requires supplier replenishment
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: Cash/GCash Reconciliation + Quick Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payment Channels Today (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Payment Reconciliation (Today)</h3>
            <p className="text-xs text-stone-500">Breakdown by cash, electronic, and card settlement</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span className="font-medium text-stone-800">Cash in Register</span>
              </div>
              <span className="font-bold font-mono-numbers text-stone-900 text-sm">
                ₱{cashSalesToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-700" />
                <span className="font-medium text-stone-800">GCash / QRPH</span>
              </div>
              <span className="font-bold font-mono-numbers text-stone-900 text-sm">
                ₱{gcashSalesToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50/50 border border-purple-100 text-xs">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-700" />
                <span className="font-medium text-stone-800">Card POS Terminal</span>
              </div>
              <span className="font-bold font-mono-numbers text-stone-900 text-sm">
                ₱{cardSalesToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex justify-between items-center">
            <span>Total Settled Today</span>
            <span className="font-bold font-mono-numbers text-stone-900">
              ₱{(cashSalesToday + gcashSalesToday + cardSalesToday).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Low Stock Alerts Table (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                <span>Inventory Alerts (Reorder Needed)</span>
                <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                  {lowStockItems.length} items
                </span>
              </h3>
              <p className="text-xs text-stone-500">Bottles at or below safety reorder threshold</p>
            </div>

            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
            >
              <span>Manage Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 text-[11px]">
                  <th className="pb-2 font-medium">Perfume Scent</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium">Current Stock</th>
                  <th className="pb-2 font-medium">Reorder Point</th>
                  <th className="pb-2 font-medium">Unit Cost</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {lowStockItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-2.5 font-medium text-stone-900">
                      <div>{item.productName}</div>
                      <div className="text-[10px] text-stone-400">{item.brand}</div>
                    </td>
                    <td className="py-2.5 font-semibold text-stone-700">{item.size}</td>
                    <td className="py-2.5">
                      <span className="font-bold font-mono-numbers text-rose-600">
                        {item.stock} bottle{item.stock !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono-numbers text-stone-500">
                      {item.reorderLevel} bottles
                    </td>
                    <td className="py-2.5 font-mono-numbers text-stone-600">
                      ₱{item.costPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setActiveTab('inventory')}
                        className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded text-[11px] font-medium"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECENT SALES TRANSACTIONS STREAM */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Recent POS Transactions</h3>
            <p className="text-xs text-stone-500">Live feed of sales with receipt reproduction</p>
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs text-stone-600 hover:text-stone-900 font-medium"
          >
            View All Sales
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-[11px]">
                <th className="pb-2 font-medium">Invoice #</th>
                <th className="pb-2 font-medium">Date &amp; Time</th>
                <th className="pb-2 font-medium">Cashier</th>
                <th className="pb-2 font-medium">Items Summary</th>
                <th className="pb-2 font-medium">Payment</th>
                <th className="pb-2 font-medium text-right">Total Amount</th>
                <th className="pb-2 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentSales.map(sale => (
                <tr key={sale.id} className="hover:bg-stone-50/50">
                  <td className="py-3 font-mono-numbers font-semibold text-stone-900">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-3 text-stone-500 text-[11px]">
                    {new Date(sale.timestamp).toLocaleDateString()} {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 text-stone-700 font-medium">
                    {sale.cashierName}
                  </td>
                  <td className="py-3 text-stone-600 max-w-xs truncate">
                    {sale.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join(', ')}
                  </td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sale.paymentMethod === 'gcash' ? 'bg-blue-100 text-blue-800' :
                      sale.paymentMethod === 'card' ? 'bg-purple-100 text-purple-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 font-mono-numbers font-bold text-stone-900 text-right">
                    ₱{sale.total.toFixed(2)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedReceipt(sale)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Print / View Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thermal Receipt Modal if opened */}
      {selectedReceipt && (
        <ThermalReceipt
          sale={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
