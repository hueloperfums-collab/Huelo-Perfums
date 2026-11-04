import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SaleTransaction } from '../../types';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  RotateCcw, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  PieChart, 
  Printer 
} from 'lucide-react';
import { ThermalReceipt } from '../pos/ThermalReceipt';

export const ReportsView: React.FC = () => {
  const { sales, expenses, products, refundSale } = useApp();

  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<SaleTransaction | null>(null);

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    if (dateRange === 'all') return sales;
    const now = new Date();
    return sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      const diffMs = now.getTime() - saleDate.getTime();
      const diffDays = diffMs / (1000 * 3600 * 24);

      if (dateRange === 'today') return diffDays <= 1;
      if (dateRange === '7days') return diffDays <= 7;
      if (dateRange === '30days') return diffDays <= 30;
      return true;
    });
  }, [sales, dateRange]);

  const completedSales = filteredSales.filter(s => s.status === 'completed');
  const refundedSales = filteredSales.filter(s => s.status === 'refunded');

  // Financial aggregates
  const totalGrossSales = completedSales.reduce((a, b) => a + b.total, 0);
  const totalCost = completedSales.reduce((a, b) => a + b.totalCost, 0);
  const totalGrossProfit = totalGrossSales - totalCost;
  const totalDiscountsGiven = completedSales.reduce((a, b) => a + b.discountAmount, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const netBusinessProfit = totalGrossProfit - totalExpenses;
  const grossMarginPercent = totalGrossSales > 0 ? (totalGrossProfit / totalGrossSales) * 100 : 0;

  // Payment Breakdown
  const cashTotal = completedSales.reduce((acc, s) => {
    if (s.paymentMethod === 'cash') return acc + s.total;
    if (s.paymentMethod === 'split') return acc + (s.paymentDetails.splitCash || 0);
    return acc;
  }, 0);

  const gcashTotal = completedSales.reduce((acc, s) => {
    if (s.paymentMethod === 'gcash') return acc + s.total;
    if (s.paymentMethod === 'split') return acc + (s.paymentDetails.splitGcash || 0);
    return acc;
  }, 0);

  const cardTotal = completedSales.reduce((acc, s) => {
    if (s.paymentMethod === 'card') return acc + s.total;
    return acc;
  }, 0);

  // Best selling scents
  const scentRankings = useMemo(() => {
    const map: Record<string, { name: string; brand: string; qty: number; revenue: number }> = {};
    for (const sale of completedSales) {
      for (const item of sale.items) {
        if (!map[item.productId]) {
          map[item.productId] = { name: item.productName, brand: item.brand, qty: 0, revenue: 0 };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.lineTotal;
      }
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [completedSales]);

  // Size distribution (10ml vs 30ml vs 50ml vs 100ml)
  const sizeBreakdown = useMemo(() => {
    const map: Record<string, number> = { '10ml': 0, '30ml': 0, '50ml': 0, '100ml': 0 };
    for (const sale of completedSales) {
      for (const item of sale.items) {
        if (map[item.size] !== undefined) {
          map[item.size] += item.quantity;
        }
      }
    }
    return map;
  }, [completedSales]);

  // Export Sales to CSV
  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Timestamp', 'Cashier', 'Customer', 'Items Sold', 'Subtotal', 'Discount', 'Total Amount', 'Payment Method', 'Status'];
    const rows = filteredSales.map(s => [
      s.invoiceNumber,
      s.timestamp,
      s.cashierName,
      s.customer?.name || 'Walk-in',
      `"${s.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join('; ')}"`,
      s.subtotal.toFixed(2),
      s.discountAmount.toFixed(2),
      s.total.toFixed(2),
      s.paymentMethod,
      s.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Huelo_Perfumes_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefund = (saleId: string, invoice: string) => {
    const reason = prompt(`Enter reason for refunding Invoice #${invoice} (Stock will be returned to inventory):`, 'Customer requested exchange or return');
    if (reason) {
      refundSale(saleId, reason);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Sales &amp; Business Profit Reports
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            P&amp;L Statements, channel reconciliations (Cash/GCash/Card), and bestselling perfumes
          </p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${dateRange === 'today' ? 'bg-stone-900 text-amber-300 shadow-xs' : 'text-stone-600'}`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7days')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${dateRange === '7days' ? 'bg-stone-900 text-amber-300 shadow-xs' : 'text-stone-600'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${dateRange === '30days' ? 'bg-stone-900 text-amber-300 shadow-xs' : 'text-stone-600'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${dateRange === 'all' ? 'bg-stone-900 text-amber-300 shadow-xs' : 'text-stone-600'}`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Download CSV for Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* PROFIT & LOSS (P&L) STATEMENT STATEMENT */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="font-bold text-base text-stone-900 font-serif-luxury">Profit &amp; Loss Statement</h3>
            <p className="text-xs text-stone-500">Official retail financial statement for selected reporting period</p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-md font-mono font-semibold">
            Net Margin: {totalGrossSales > 0 ? ((netBusinessProfit / totalGrossSales) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          <div className="py-2.5 flex justify-between items-center text-stone-700">
            <span className="font-medium">Gross Retail Sales (Before Discounts)</span>
            <span className="font-mono-numbers font-semibold text-stone-900">
              ₱{(totalGrossSales + totalDiscountsGiven).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center text-stone-600">
            <span>Less: Promotional Discounts &amp; Senior/PWD Deductions</span>
            <span className="font-mono-numbers text-rose-600">
              -₱{totalDiscountsGiven.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center font-bold text-stone-900 bg-stone-50 px-3 rounded">
            <span>Net Sales Revenue</span>
            <span className="font-mono-numbers text-sm">
              ₱{totalGrossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center text-stone-600">
            <span>Less: Cost of Goods Sold (Perfume Oils, Flacons, Atomizers)</span>
            <span className="font-mono-numbers text-rose-600 font-semibold">
              -₱{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center font-bold text-emerald-800 bg-emerald-50 px-3 rounded">
            <span>Gross Business Profit</span>
            <span className="font-mono-numbers text-sm">
              ₱{totalGrossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center text-stone-600">
            <span>Less: Operating Expenses (Rent, Utilities, Packaging, Solvents)</span>
            <span className="font-mono-numbers text-amber-700 font-semibold">
              -₱{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-3 flex justify-between items-center font-bold text-stone-950 bg-amber-100 px-3 rounded-lg text-base">
            <span>NET BUSINESS PROFIT</span>
            <span className="font-mono-numbers text-lg text-amber-950">
              ₱{netBusinessProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN: BESTSELLERS + SIZE DEMAND + PAYMENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Scents Ranking (4 cols) */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-stone-900">Bestselling Scents (By Revenue)</h3>
          <div className="space-y-3 text-xs">
            {scentRankings.map((scent, i) => (
              <div key={i} className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <span className="text-[10px] bg-stone-100 font-bold px-1.5 py-0.2 rounded text-stone-600">#{i + 1}</span>
                    <span>{scent.name}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">{scent.brand} · {scent.qty} bottles sold</div>
                </div>
                <div className="font-bold font-mono-numbers text-stone-900">
                  ₱{scent.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Bottle Sizes Demand */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-stone-900">Bottle Size Preference</h3>
          <div className="space-y-3 text-xs">
            {(['10ml', '30ml', '50ml', '100ml'] as const).map(size => {
              const qty = sizeBreakdown[size] || 0;
              const totalSizeBottles = Object.values(sizeBreakdown).reduce((a, b) => a + b, 0) || 1;
              const pct = ((qty / totalSizeBottles) * 100).toFixed(0);

              return (
                <div key={size} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-stone-700">{size} Bottles</span>
                    <span className="font-mono-numbers text-stone-900">{qty} bottles ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Channels Reconciliation */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-stone-900">Channel Reconciliation</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="font-medium text-emerald-900">Cash Collections</span>
              <span className="font-bold font-mono-numbers text-stone-900">₱{cashTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-blue-50 border border-blue-100">
              <span className="font-medium text-blue-900">GCash / QRPH</span>
              <span className="font-bold font-mono-numbers text-stone-900">₱{gcashTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-purple-50 border border-purple-100">
              <span className="font-medium text-purple-900">Card Payment Terminal</span>
              <span className="font-bold font-mono-numbers text-stone-900">₱{cardTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SALES AUDIT AND RETURNS / REFUNDS LOG */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">All Sales Invoices &amp; Returns Management</h3>
            <p className="text-xs text-stone-500">Audit sales records, reprint receipts, or process customer returns</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-medium">Invoice #</th>
                <th className="py-2.5 px-3 font-medium">Date &amp; Time</th>
                <th className="py-2.5 px-3 font-medium">Cashier</th>
                <th className="py-2.5 px-3 font-medium">Customer</th>
                <th className="py-2.5 px-3 font-medium">Payment</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Total (₱)</th>
                <th className="py-2.5 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSales.map(sale => {
                const isRefunded = sale.status === 'refunded';

                return (
                  <tr key={sale.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-mono-numbers font-semibold text-stone-900">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 text-[11px]">
                      {new Date(sale.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-stone-700">{sale.cashierName}</td>
                    <td className="py-2.5 px-3 text-stone-600">{sale.customer?.name || 'Walk-in'}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-stone-600">
                      {sale.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        isRefunded ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sale.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-stone-900 text-right">
                      ₱{sale.total.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      <button
                        onClick={() => setSelectedReceipt(sale)}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-medium"
                        title="Reprint Receipt"
                      >
                        Receipt
                      </button>
                      {!isRefunded && (
                        <button
                          onClick={() => handleRefund(sale.id, sale.invoiceNumber)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-medium"
                          title="Refund & Restore Stock"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ThermalReceipt
          sale={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
