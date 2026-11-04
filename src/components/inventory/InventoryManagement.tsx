import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PerfumeProduct, PerfumeVariant } from '../../types';
import { 
  Layers, 
  PlusCircle, 
  SlidersHorizontal, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDownToLine, 
  DollarSign, 
  TrendingUp, 
  Barcode 
} from 'lucide-react';
import { StockInModal } from './StockInModal';
import { StockAdjustModal } from './StockAdjustModal';

export const InventoryManagement: React.FC = () => {
  const { products, auditLogs } = useApp();

  const [search, setSearch] = useState<string>('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'inventory_table' | 'movements_log'>('inventory_table');

  // Modals
  const [showStockIn, setShowStockIn] = useState<boolean>(false);
  const [adjustTarget, setAdjustTarget] = useState<{ product: PerfumeProduct; variant: PerfumeVariant } | null>(null);

  // Flatten all variants with their product parent
  const allVariants = useMemo(() => {
    return products.flatMap(p => 
      p.variants.map(v => ({
        product: p,
        variant: v
      }))
    );
  }, [products]);

  // Overall Inventory Financial Valuations
  const totalBottles = allVariants.reduce((sum, item) => sum + item.variant.stock, 0);
  const totalCostValuation = allVariants.reduce((sum, item) => sum + (item.variant.stock * item.variant.costPrice), 0);
  const totalRetailValuation = allVariants.reduce((sum, item) => sum + (item.variant.stock * item.variant.sellingPrice), 0);
  const totalUnrealizedProfit = totalRetailValuation - totalCostValuation;

  // Filtered variants
  const filteredItems = useMemo(() => {
    return allVariants.filter(({ product, variant }) => {
      if (filterLowStockOnly && variant.stock > variant.reorderLevel) {
        return false;
      }
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        variant.barcode.toLowerCase().includes(q) ||
        variant.size.toLowerCase().includes(q)
      );
    });
  }, [allVariants, filterLowStockOnly, search]);

  const stockRelatedLogs = auditLogs.filter(
    l => l.action.includes('Stock') || l.action.includes('Sale Completed')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Perfume Inventory &amp; Stock Levels
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor bottle counts, restock thresholds, total inventory valuation, and supplier stock-in
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdjustTarget({ product: products[0], variant: products[0]?.variants[0] })}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone-600" />
            <span>Stock Adjustment</span>
          </button>

          <button
            onClick={() => setShowStockIn(true)}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Receive Stock-In</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Bottles in Stock
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-stone-900">
            {totalBottles.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500">Across {allVariants.length} distinct sizes &amp; scents</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Inventory Asset Value (At Cost)
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-stone-900">
            ₱{totalCostValuation.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-stone-500">Capital tied in finished inventory</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Potential Retail Value
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-stone-900">
            ₱{totalRetailValuation.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">Expected revenue when fully sold</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Projected Gross Margin
          </div>
          <div className="text-3xl font-bold font-mono-numbers text-amber-700">
            ₱{totalUnrealizedProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-stone-500">
            Markup: <strong className="font-semibold text-stone-800">{totalCostValuation > 0 ? ((totalUnrealizedProfit / totalCostValuation) * 100).toFixed(0) : 0}%</strong>
          </div>
        </div>
      </div>

      {/* Tabs: Inventory Table vs Movements Log */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory_table')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'inventory_table'
              ? 'bg-stone-900 text-amber-300'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          All Variant Inventory ({allVariants.length})
        </button>
        <button
          onClick={() => setActiveTab('movements_log')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'movements_log'
              ? 'bg-stone-900 text-amber-300'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Stock Movement Log ({stockRelatedLogs.length})
        </button>
      </div>

      {activeTab === 'inventory_table' && (
        <div className="space-y-4">
          
          {/* Controls: Search and Low Stock filter */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search variant, size, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  checked={filterLowStockOnly}
                  onChange={(e) => setFilterLowStockOnly(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="font-medium text-stone-700">Filter Low Stock / Reorder (&le; threshold)</span>
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-medium">Perfume Product</th>
                    <th className="py-3 px-4 font-medium">Size</th>
                    <th className="py-3 px-4 font-medium">Barcode</th>
                    <th className="py-3 px-4 font-medium">Cost (₱)</th>
                    <th className="py-3 px-4 font-medium">Retail (₱)</th>
                    <th className="py-3 px-4 font-medium">Available Stock</th>
                    <th className="py-3 px-4 font-medium">Reorder Alert</th>
                    <th className="py-3 px-4 font-medium">Stock Value (Cost)</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredItems.map(({ product, variant }) => {
                    const isOutOfStock = variant.stock <= 0;
                    const isLowStock = variant.stock > 0 && variant.stock <= variant.reorderLevel;
                    const itemCostValue = variant.stock * variant.costPrice;

                    return (
                      <tr key={variant.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-900">{product.name}</div>
                          <div className="text-[10px] text-stone-400">{product.brand} · {product.category}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-800">{variant.size}</td>
                        <td className="py-3 px-4 font-mono-numbers text-stone-500 text-[11px]">{variant.barcode}</td>
                        <td className="py-3 px-4 font-mono-numbers text-stone-600">₱{variant.costPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 font-mono-numbers font-semibold text-stone-900">₱{variant.sellingPrice.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono-numbers font-bold text-sm ${
                              isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-stone-900'
                            }`}>
                              {variant.stock}
                            </span>
                            {isOutOfStock ? (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                                OOS
                              </span>
                            ) : isLowStock ? (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                Low
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 font-medium">OK</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono-numbers text-stone-500">
                          {variant.reorderLevel} bottles
                        </td>
                        <td className="py-3 px-4 font-mono-numbers font-semibold text-stone-800">
                          ₱{itemCostValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setAdjustTarget({ product, variant })}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium text-[11px] transition-colors"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'movements_log' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Stock Movement Audit Trail</h3>
            <p className="text-xs text-stone-500">Chronological history of deliveries, checkout deductions, and adjustments</p>
          </div>

          <div className="divide-y divide-stone-100">
            {stockRelatedLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{log.action}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500 font-medium">{log.user}</span>
                  </div>
                  <div className="text-stone-600 mt-0.5">{log.details}</div>
                </div>
                <div className="text-stone-400 text-[11px] shrink-0 font-mono-numbers">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      {showStockIn && (
        <StockInModal onClose={() => setShowStockIn(false)} />
      )}

      {/* Stock Adjust Modal */}
      {adjustTarget && (
        <StockAdjustModal
          product={adjustTarget.product}
          variant={adjustTarget.variant}
          onClose={() => setAdjustTarget(null)}
        />
      )}
    </div>
  );
};
