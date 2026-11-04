import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { 
  Plus, 
  Receipt, 
  Trash2, 
  DollarSign, 
  TrendingDown, 
  Tag, 
  X, 
  CheckCircle2, 
  PieChart 
} from 'lucide-react';

const EXPENSE_CATEGORIES: Expense['category'][] = [
  'Fragrance Oils',
  'Bottles & Sprayers',
  'Packaging & Boxes',
  'Alcohol & Solvents',
  'Rent & Utilities',
  'Salaries',
  'Marketing & Ads',
  'Store Maintenance',
  'Miscellaneous'
];

export const ExpensesManagement: React.FC = () => {
  const { expenses, addExpense, deleteExpense, sales } = useApp();

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('All');

  // Form State
  const [category, setCategory] = useState<Expense['category']>('Packaging & Boxes');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  // Net Profit formula calculation:
  // Net Profit = Sales - Cost of Goods Sold - Expenses
  const completedSales = sales.filter(s => s.status === 'completed');
  const totalGrossSales = completedSales.reduce((acc, s) => acc + s.total, 0);
  const totalCOGS = completedSales.reduce((acc, s) => acc + s.totalCost, 0);
  const grossProfit = totalGrossSales - totalCOGS;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netBusinessProfit = grossProfit - totalExpenses;
  const netMarginPercent = totalGrossSales > 0 ? (netBusinessProfit / totalGrossSales) * 100 : 0;

  const filteredExpenses = expenses.filter(e => {
    if (selectedCatFilter === 'All') return true;
    return e.category === selectedCatFilter;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    addExpense({
      category,
      description: description.trim() || `${category} business purchase`,
      amount: parsedAmount,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined
    });

    setDescription('');
    setAmount('');
    setReferenceNumber('');
    setIsAddOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Operating Expenses &amp; Cost Tracking
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Log shop overhead, raw fragrance oils, flacons, alcohol solvent base, and calculate net business profit
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* NET PROFIT FORMULA BREAKDOWN CARD (From Section 5 specification) */}
      <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm text-stone-200">
              Net Profit Equation: Net Profit = Total Sales − COGS − Operating Expenses
            </span>
          </div>
          <span className="text-xs text-stone-400 font-mono-numbers">
            Net Margin: <strong className="text-amber-300 font-bold">{netMarginPercent.toFixed(1)}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700/60">
            <div className="text-stone-400 font-medium">1. Gross Sales Revenue</div>
            <div className="text-xl font-bold font-mono-numbers text-stone-100 mt-1">
              ₱{totalGrossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-stone-400">All customer receipts</div>
          </div>

          <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700/60">
            <div className="text-stone-400 font-medium">2. Cost of Goods Sold (COGS)</div>
            <div className="text-xl font-bold font-mono-numbers text-rose-400 mt-1">
              -₱{totalCOGS.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-stone-400">Bottles, oils &amp; bases sold</div>
          </div>

          <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700/60">
            <div className="text-stone-400 font-medium">3. Operating Expenses</div>
            <div className="text-xl font-bold font-mono-numbers text-amber-400 mt-1">
              -₱{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-stone-400">Packaging, solvents &amp; utilities</div>
          </div>

          <div className="bg-amber-400 text-stone-950 p-3.5 rounded-xl shadow-xs">
            <div className="font-bold uppercase tracking-wider text-[11px] text-stone-800">
              = Net Business Profit
            </div>
            <div className="text-2xl font-bold font-mono-numbers mt-1">
              ₱{netBusinessProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-semibold text-stone-800">Bottom-line net earnings</div>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', ...EXPENSE_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCatFilter(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCatFilter === cat
                ? 'bg-stone-900 text-amber-300'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px]">
              <tr>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Expense Category</th>
                <th className="py-3 px-4 font-medium">Description / Details</th>
                <th className="py-3 px-4 font-medium">Payment Channel</th>
                <th className="py-3 px-4 font-medium">Recorded By</th>
                <th className="py-3 px-4 font-medium text-right">Amount (₱)</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono-numbers text-stone-600">{exp.date}</td>
                  <td className="py-3 px-4 font-semibold text-stone-900">{exp.category}</td>
                  <td className="py-3 px-4 text-stone-700">
                    <div>{exp.description}</div>
                    {exp.referenceNumber && (
                      <span className="font-mono-numbers text-[10px] text-stone-400">Ref: {exp.referenceNumber}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[10px] text-stone-600">
                    <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600 font-medium">{exp.recordedBy}</td>
                  <td className="py-3 px-4 font-mono-numbers font-bold text-stone-900 text-right">
                    ₱{exp.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete expense "${exp.description}" (₱${exp.amount})?`)) {
                          deleteExpense(exp.id);
                        }
                      }}
                      className="text-stone-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-semibold text-stone-900 text-base">Record Operating Expense</h3>
                <p className="text-xs text-stone-500">Log business purchases and shop maintenance</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Description / Item *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 pcs Velvet drawstring perfume pouches"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Amount (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono-numbers text-sm font-bold text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Invoice / Receipt Reference No.</label>
                <input
                  type="text"
                  placeholder="e.g. OR-89102 or GCash Ref"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
