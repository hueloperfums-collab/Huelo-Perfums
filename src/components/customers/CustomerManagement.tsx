import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Award, 
  Phone, 
  Mail, 
  ShoppingBag, 
  X, 
  CheckCircle2 
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { customers, addCustomer, sales, setActiveTab } = useApp();

  const [search, setSearch] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [selectedCustHistory, setSelectedCustHistory] = useState<Customer | null>(null);

  // Form
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setIsAddOpen(false);
  };

  const getCustomerSales = (custId: string) => {
    return sales.filter(s => s.customer?.id === custId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Customers &amp; Loyalty Rewards
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track VIP fragrance clientele, loyalty points (1 point per ₱50 spent), and lifetime order histories
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Customer</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Registered VIPs
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-stone-900">
            {customers.length}
          </div>
          <div className="text-[11px] text-stone-500">Active perfume collectors</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Outstanding Loyalty Points
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-amber-700">
            {customers.reduce((a, b) => a + b.loyaltyPoints, 0).toLocaleString()} pts
          </div>
          <div className="text-[11px] text-stone-500">Value: ₱{customers.reduce((a, b) => a + b.loyaltyPoints, 0).toLocaleString()} in customer rewards</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Client Lifetime Spend
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-stone-900">
            ₱{customers.reduce((a, b) => a + b.totalSpend, 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-stone-500">Across repeat fragrance orders</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, mobile phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px]">
              <tr>
                <th className="py-3 px-4 font-medium">Customer Name</th>
                <th className="py-3 px-4 font-medium">Contact Details</th>
                <th className="py-3 px-4 font-medium">VIP Tier</th>
                <th className="py-3 px-4 font-medium">Loyalty Points</th>
                <th className="py-3 px-4 font-medium">Total Orders</th>
                <th className="py-3 px-4 font-medium text-right">Lifetime Spend</th>
                <th className="py-3 px-4 font-medium text-right">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900">{c.name}</div>
                    <div className="text-[10px] text-stone-400">Member since {c.joinedDate}</div>
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    <div className="font-mono-numbers">{c.phone}</div>
                    {c.email && <div className="text-[11px] text-stone-400">{c.email}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      c.tier === 'VIP' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      c.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      c.tier === 'Silver' ? 'bg-stone-200 text-stone-800' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {c.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-numbers font-bold text-amber-800 text-sm">
                    {c.loyaltyPoints} pts
                  </td>
                  <td className="py-3 px-4 font-mono-numbers text-stone-700">
                    {c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''}
                  </td>
                  <td className="py-3 px-4 font-mono-numbers font-bold text-stone-900 text-right">
                    ₱{c.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustHistory(c)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-medium transition-colors"
                    >
                      Orders
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-semibold text-stone-900 text-base">Register Fragrance VIP</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Mobile / GCash Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0917-884-2190"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. maria@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Fragrance Preference / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Loves gourmand and woody floral notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
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
                  <span>Save Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {selectedCustHistory && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-semibold text-stone-900 text-base">{selectedCustHistory.name}'s Purchase History</h3>
                <p className="text-xs text-stone-500 font-mono-numbers">
                  {selectedCustHistory.phone} · {selectedCustHistory.loyaltyPoints} points available
                </p>
              </div>
              <button onClick={() => setSelectedCustHistory(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 text-xs">
              {getCustomerSales(selectedCustHistory.id).length === 0 ? (
                <div className="text-center py-8 text-stone-400">No past orders on record.</div>
              ) : (
                getCustomerSales(selectedCustHistory.id).map(sale => (
                  <div key={sale.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold font-mono-numbers text-stone-900">{sale.invoiceNumber}</span>
                      <span className="font-bold font-mono-numbers text-stone-950 text-sm">₱{sale.total.toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {new Date(sale.timestamp).toLocaleString()} · Paid via {sale.paymentMethod.toUpperCase()}
                    </div>
                    <div className="text-stone-600 text-[11px]">
                      {sale.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustHistory(null)}
                className="px-4 py-2 bg-stone-900 text-stone-100 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
