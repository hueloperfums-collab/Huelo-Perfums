import React, { useState } from 'react';
import { PerfumeProduct, PerfumeVariant, Category, PerfumeSize } from '../../types';
import { X, Plus, Trash2, Sparkles } from 'lucide-react';

interface ProductModalProps {
  product?: PerfumeProduct | null;
  onClose: () => void;
  onSave: (product: PerfumeProduct) => void;
}

const AVAILABLE_IMAGES = [
  { label: 'Obsidian Noir Bottle', url: '/src/assets/images/perfume_noir_marble_1793767551333.jpg' },
  { label: 'Amber Crystal Bottle', url: '/src/assets/images/perfume_amber_luxury_1793767551103.jpg' },
  { label: 'Botanical Clear Flacon', url: '/src/assets/images/perfume_crystal_fresh_1793767552606.jpg' },
  { label: 'Size Variants Lineup', url: '/src/assets/images/perfume_variants_lineup_1793767552523.jpg' },
];

const STANDARD_SIZES: PerfumeSize[] = ['10ml', '30ml', '50ml', '100ml', 'Tester'];

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
  const isEditing = !!product;

  const [name, setName] = useState<string>(product?.name || '');
  const [brand, setBrand] = useState<string>(product?.brand || '');
  const [category, setCategory] = useState<Category>(product?.category || 'Men');
  const [concentration, setConcentration] = useState<PerfumeProduct['concentration']>(
    product?.concentration || 'Extrait de Parfum (30% Oil)'
  );
  const [imageUrl, setImageUrl] = useState<string>(
    product?.imageUrl || AVAILABLE_IMAGES[0].url
  );
  const [description, setDescription] = useState<string>(product?.description || '');
  const [topNotes, setTopNotes] = useState<string>(product?.fragranceNotes.top || '');
  const [heartNotes, setHeartNotes] = useState<string>(product?.fragranceNotes.heart || '');
  const [baseNotes, setBaseNotes] = useState<string>(product?.fragranceNotes.base || '');
  const [isBestSeller, setIsBestSeller] = useState<boolean>(product?.isBestSeller || false);

  // Variants state
  const [variants, setVariants] = useState<PerfumeVariant[]>(() => {
    if (product && product.variants.length > 0) {
      return [...product.variants];
    }
    // Default starter variants: 10ml, 30ml, 50ml, 100ml
    return [
      { id: `var-${Date.now()}-10`, size: '10ml', costPrice: 50, sellingPrice: 150, stock: 15, reorderLevel: 5, barcode: 'PERF-NEW-10ML', sku: 'NEW-10' },
      { id: `var-${Date.now()}-30`, size: '30ml', costPrice: 120, sellingPrice: 280, stock: 20, reorderLevel: 5, barcode: 'PERF-NEW-30ML', sku: 'NEW-30' },
      { id: `var-${Date.now()}-50`, size: '50ml', costPrice: 180, sellingPrice: 420, stock: 10, reorderLevel: 5, barcode: 'PERF-NEW-50ML', sku: 'NEW-50' },
      { id: `var-${Date.now()}-100`, size: '100ml', costPrice: 290, sellingPrice: 750, stock: 8, reorderLevel: 3, barcode: 'PERF-NEW-100ML', sku: 'NEW-100' },
    ];
  });

  const handleUpdateVariant = (index: number, field: keyof PerfumeVariant, val: any) => {
    setVariants(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleAddVariant = () => {
    const nextSize = STANDARD_SIZES.find(s => !variants.some(v => v.size === s)) || '50ml';
    const newVar: PerfumeVariant = {
      id: `var-${Date.now()}`,
      size: nextSize,
      costPrice: 150,
      sellingPrice: 350,
      stock: 10,
      reorderLevel: 5,
      barcode: `PERF-${name.slice(0, 4).toUpperCase() || 'FRAG'}-${nextSize.toUpperCase()}`,
      sku: `${name.slice(0, 3).toUpperCase() || 'FG'}-${nextSize}`
    };
    setVariants(prev => [...prev, newVar]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('Product must have at least one variant.');
      return;
    }
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const autoGenerateBarcodes = () => {
    const cleanName = (name || 'PERF').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    setVariants(prev => prev.map(v => ({
      ...v,
      barcode: `PERF-${cleanName}-${v.size.toUpperCase()}`,
      sku: `${cleanName}-${v.size}`
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedProduct: PerfumeProduct = {
      id: product?.id || `prod-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || 'Inspired Fragrance',
      category,
      concentration,
      fragranceNotes: {
        top: topNotes.trim() || 'Fresh Bergamot',
        heart: heartNotes.trim() || 'Floral Woody Heart',
        base: baseNotes.trim() || 'Amber Musk Base'
      },
      description: description.trim() || `${name} artisan formulation.`,
      imageUrl,
      variants,
      isBestSeller,
      active: true,
      createdAt: product?.createdAt || new Date().toISOString()
    };

    onSave(savedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-semibold text-stone-900 text-lg">
              {isEditing ? `Edit: ${product?.name}` : 'Create New Perfume & Variants'}
            </h3>
            <p className="text-xs text-stone-500">Configure fragrance profile, cost pricing, and stock variants</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Basic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Perfume Scent Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sauvage Inspired"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Brand / Inspiration *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dior Inspired"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-900 bg-white focus:outline-none"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Luxury">Luxury</option>
                <option value="Gourmand">Gourmand</option>
                <option value="Fresh & Citrus">Fresh &amp; Citrus</option>
                <option value="Woody & Oriental">Woody &amp; Oriental</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Oil Concentration</label>
              <select
                value={concentration}
                onChange={(e) => setConcentration(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-900 bg-white focus:outline-none"
              >
                <option value="Extrait de Parfum (30% Oil)">Extrait de Parfum (30% Oil)</option>
                <option value="Eau de Parfum (20% Oil)">Eau de Parfum (20% Oil)</option>
                <option value="Eau de Toilette (15% Oil)">Eau de Toilette (15% Oil)</option>
              </select>
            </div>
          </div>

          {/* Fragrance Notes (Olfactive Pyramid) */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
            <div className="font-semibold text-stone-800">Olfactive Notes Pyramid</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-600 mb-1">Top Notes (Opening)</label>
                <input
                  type="text"
                  placeholder="e.g. Bergamot, Pink Pepper"
                  value={topNotes}
                  onChange={(e) => setTopNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1">Heart Notes (Body)</label>
                <input
                  type="text"
                  placeholder="e.g. Lavender, Geranium"
                  value={heartNotes}
                  onChange={(e) => setHeartNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1">Base Notes (Dry Down)</label>
                <input
                  type="text"
                  placeholder="e.g. Ambroxan, Cedar, Musk"
                  value={baseNotes}
                  onChange={(e) => setBaseNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Image & Best Seller Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-stone-700 font-semibold mb-1">Boutique Photo Style</label>
              <select
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-900 bg-white"
              >
                {AVAILABLE_IMAGES.map((img, i) => (
                  <option key={i} value={img.url}>{img.label}</option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="font-semibold text-stone-800">Mark as Best Seller</span>
              </label>
            </div>
          </div>

          {/* VARIANTS AND PRICING TABLE */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-900 text-sm">Size Variants &amp; Pricing</span>
                <span className="text-stone-500 ml-2">(10ml, 30ml, 50ml, 100ml)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={autoGenerateBarcodes}
                  className="px-2.5 py-1 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Auto Barcodes</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-2.5 py-1 text-xs text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-md font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Size</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
                  <tr>
                    <th className="p-2.5 font-medium">Size</th>
                    <th className="p-2.5 font-medium">Cost (₱)</th>
                    <th className="p-2.5 font-medium">Selling (₱)</th>
                    <th className="p-2.5 font-medium">Profit Margin</th>
                    <th className="p-2.5 font-medium">Stock</th>
                    <th className="p-2.5 font-medium">Reorder</th>
                    <th className="p-2.5 font-medium">Barcode</th>
                    <th className="p-2.5 font-medium text-right">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {variants.map((v, idx) => {
                    const margin = v.sellingPrice > 0 
                      ? (((v.sellingPrice - v.costPrice) / v.sellingPrice) * 100).toFixed(0) 
                      : '0';

                    return (
                      <tr key={v.id}>
                        <td className="p-2">
                          <select
                            value={v.size}
                            onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value as PerfumeSize)}
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 font-semibold"
                          >
                            {STANDARD_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={v.costPrice}
                            onChange={(e) => handleUpdateVariant(idx, 'costPrice', parseFloat(e.target.value) || 0)}
                            className="w-18 bg-stone-50 border border-stone-200 rounded px-2 py-1 font-mono-numbers"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={v.sellingPrice}
                            onChange={(e) => handleUpdateVariant(idx, 'sellingPrice', parseFloat(e.target.value) || 0)}
                            className="w-18 bg-stone-50 border border-stone-200 rounded px-2 py-1 font-mono-numbers font-bold text-stone-900"
                          />
                        </td>
                        <td className="p-2 font-mono-numbers text-stone-600">
                          {margin}%
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                            className="w-16 bg-stone-50 border border-stone-200 rounded px-2 py-1 font-mono-numbers"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={v.reorderLevel}
                            onChange={(e) => handleUpdateVariant(idx, 'reorderLevel', parseInt(e.target.value) || 1)}
                            className="w-14 bg-stone-50 border border-stone-200 rounded px-2 py-1 font-mono-numbers"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={v.barcode}
                            onChange={(e) => handleUpdateVariant(idx, 'barcode', e.target.value)}
                            className="w-32 bg-stone-50 border border-stone-200 rounded px-2 py-1 font-mono-numbers text-[11px]"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
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

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold rounded-xl"
            >
              {isEditing ? 'Save Changes' : 'Create Perfume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
