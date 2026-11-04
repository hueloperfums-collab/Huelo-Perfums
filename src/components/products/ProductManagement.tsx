import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PerfumeProduct, Category } from '../../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Barcode, 
  Layers, 
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { ProductModal } from './ProductModal';
import { BarcodePrintModal } from './BarcodePrintModal';

export const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, setActiveTab } = useApp();

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<PerfumeProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [barcodeProduct, setBarcodeProduct] = useState<PerfumeProduct | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const q = search.toLowerCase().trim();
      if (!q) return matchCat;
      const matchText = 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.fragranceNotes.top.toLowerCase().includes(q) ||
        p.fragranceNotes.heart.toLowerCase().includes(q) ||
        p.fragranceNotes.base.toLowerCase().includes(q) ||
        p.variants.some(v => v.barcode.toLowerCase().includes(q));
      return matchCat && matchText;
    });
  }, [products, categoryFilter, search]);

  const handleOpenAdd = () => {
    setSelectedProductForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PerfumeProduct) => {
    setSelectedProductForEdit(p);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (saved: PerfumeProduct) => {
    if (selectedProductForEdit) {
      updateProduct(saved);
    } else {
      addProduct(saved);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your perfume catalog?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Perfume Products &amp; Variants
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage fragrance catalog, size variations (10ml, 30ml, 50ml, 100ml), cost margins, and barcodes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4 text-stone-600" />
            <span>Go to Inventory</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Perfume</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by perfume name, brand, notes, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-stone-500 font-medium shrink-0">Category:</span>
          {['All', 'Men', 'Women', 'Unisex', 'Luxury', 'Gourmand', 'Fresh & Citrus'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-stone-900 text-amber-300'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Grid */}
      <div className="space-y-4">
        {filteredProducts.map(product => {
          const totalStock = product.variants.reduce((a, b) => a + b.stock, 0);
          const hasLowStock = product.variants.some(v => v.stock <= v.reorderLevel);

          return (
            <div 
              key={product.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-all p-5 space-y-4"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Perfume Identity */}
                <div className="flex items-start gap-4">
                  <button 
                    type="button"
                    onClick={() => handleOpenEdit(product)}
                    className="relative w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200 group cursor-pointer hover:border-amber-500 transition-all text-left"
                    title="Click to edit perfume & image"
                  >
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-amber-300 transition-opacity">
                      <Camera className="w-5 h-5" />
                    </div>
                  </button>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-amber-800">{product.brand}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.concentration}</span>
                    </div>

                    <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <span>{product.name}</span>
                      {product.isBestSeller && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded uppercase">
                          Best Seller
                        </span>
                      )}
                    </h2>

                    <div className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      <span className="text-stone-400 font-medium">Notes:</span> {product.fragranceNotes.top} → {product.fragranceNotes.heart} → {product.fragranceNotes.base}
                    </div>
                  </div>
                </div>

                {/* Quick Stock Summary & Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <div className="text-right mr-2 hidden sm:block">
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider">Total On-Hand</div>
                    <div className="text-sm font-bold font-mono-numbers text-stone-900">
                      {totalStock} bottles
                    </div>
                  </div>

                  <button
                    onClick={() => setBarcodeProduct(product)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
                    title="Print Barcode Stickers"
                  >
                    <Barcode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
                    title="Edit Product &amp; Variants"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Variants Detailed Table */}
              <div className="overflow-x-auto border border-stone-100 rounded-lg">
                <table className="w-full text-left text-xs bg-stone-50/50">
                  <thead>
                    <tr className="border-b border-stone-200/60 text-stone-500 text-[11px]">
                      <th className="py-2 px-3 font-medium">Size</th>
                      <th className="py-2 px-3 font-medium">Cost Price</th>
                      <th className="py-2 px-3 font-medium">Selling Price</th>
                      <th className="py-2 px-3 font-medium">Gross Profit</th>
                      <th className="py-2 px-3 font-medium">Margin</th>
                      <th className="py-2 px-3 font-medium">Stock On-Hand</th>
                      <th className="py-2 px-3 font-medium">Barcode (SKU)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/40">
                    {product.variants.map((v) => {
                      const profit = v.sellingPrice - v.costPrice;
                      const margin = v.sellingPrice > 0 ? ((profit / v.sellingPrice) * 100).toFixed(0) : '0';
                      const isLow = v.stock <= v.reorderLevel;

                      return (
                        <tr key={v.id} className="hover:bg-white transition-colors">
                          <td className="py-2 px-3 font-bold text-stone-900">{v.size}</td>
                          <td className="py-2 px-3 font-mono-numbers text-stone-600">₱{v.costPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 font-mono-numbers font-semibold text-stone-900">₱{v.sellingPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 font-mono-numbers text-emerald-700 font-medium">₱{profit.toFixed(2)}</td>
                          <td className="py-2 px-3 font-mono-numbers text-stone-600">{margin}%</td>
                          <td className="py-2 px-3">
                            <span className={`font-mono-numbers font-semibold ${isLow ? 'text-rose-600' : 'text-stone-800'}`}>
                              {v.stock} bottle{v.stock !== 1 ? 's' : ''}
                            </span>
                            {isLow && (
                              <span className="ml-2 text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                                Low
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono-numbers text-stone-500 text-[11px]">{v.barcode}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500">
          No perfumes found matching your filters.
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <ProductModal
          product={selectedProductForEdit}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {/* Barcode Print Modal */}
      {barcodeProduct && (
        <BarcodePrintModal
          product={barcodeProduct}
          onClose={() => setBarcodeProduct(null)}
        />
      )}
    </div>
  );
};
