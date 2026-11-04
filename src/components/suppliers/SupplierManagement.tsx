import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  X, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export const SupplierManagement: React.FC = () => {
  const { suppliers, addSupplier, setActiveTab } = useApp();

  const [search, setSearch] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [categoriesText, setCategoriesText] = useState<string>('Fragrance Oils, Solvents');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3);

  const filteredSuppliers = suppliers.filter(s => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.categoriesSupplied.some(c => c.toLowerCase().includes(q))
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSupplier({
      name: name.trim(),
      contactPerson: contactPerson.trim() || 'Sales Representative',
      phone: phone.trim() || 'N/A',
      email: email.trim() || 'supply@partner.ph',
      address: address.trim() || 'Metro Manila, Philippines',
      categoriesSupplied: categoriesText.split(',').map(s => s.trim()).filter(Boolean),
      leadTimeDays: Math.max(1, leadTimeDays)
    });

    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsAddOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Raw Material &amp; Bottle Suppliers
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage fragrance oil importers, glass bottle manufacturers, sprayers, and perfumer alcohol vendors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4 text-stone-600" />
            <span>Receive Stock-In</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, product category, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map(supplier => (
          <div 
            key={supplier.id}
            className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4 hover:border-stone-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{supplier.name}</h3>
                  <div className="text-xs text-amber-800 font-medium">{supplier.contactPerson}</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-100 text-stone-700">
                  <Truck className="w-4 h-4" />
                </div>
              </div>

              {/* Supplied categories */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                {supplier.categoriesSupplied.map((cat, idx) => (
                  <span key={idx} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                    {cat}
                  </span>
                ))}
              </div>

              {/* Contact info details */}
              <div className="space-y-1 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="font-mono-numbers">{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{supplier.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Lead time: <strong className="font-semibold text-stone-800">{supplier.leadTimeDays} days</strong></span>
              </div>

              <button
                onClick={() => setActiveTab('inventory')}
                className="text-amber-800 hover:text-amber-900 font-semibold"
              >
                Create Stock-In &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-semibold text-stone-900 text-base">Register Supplier</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grasse Fine Fragrances Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Contact Representative</label>
                <input
                  type="text"
                  placeholder="e.g. Henry Lim"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Phone / Mobile</label>
                  <input
                    type="text"
                    placeholder="0917-000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Delivery Lead Time</label>
                  <input
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  placeholder="orders@supplier.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Warehouse / Office Address</label>
                <input
                  type="text"
                  placeholder="e.g. Pasig City, Metro Manila"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Materials Supplied (comma separated)</label>
                <input
                  type="text"
                  placeholder="Fragrance Oils, Glass Flacons, Sprayers, Fixatives"
                  value={categoriesText}
                  onChange={(e) => setCategoriesText(e.target.value)}
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
                  <span>Save Supplier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
