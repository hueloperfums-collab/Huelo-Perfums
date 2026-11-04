import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PerfumeProduct, PerfumeVariant, Category } from '../../types';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  Tag, 
  Percent, 
  Award, 
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { ThermalReceipt } from './ThermalReceipt';

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Men',
  'Women',
  'Unisex',
  'Luxury',
  'Gourmand',
  'Fresh & Citrus',
  'Woody & Oriental'
];

export const POSTerminal: React.FC = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    setCartQuantityExact, 
    clearCart,
    cartSubtotal,
    discountAmount,
    cartTotal,
    discount,
    setDiscount,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    addCustomer
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [barcodeFeedback, setBarcodeFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Track selected variant per product card (default to 30ml or first available)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Checkout & Receipt Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  // New Customer quick modal state
  const [showAddCustomer, setShowAddCustomer] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustEmail, setNewCustEmail] = useState<string>('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.active) return false;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery = 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.fragranceNotes.top.toLowerCase().includes(q) ||
        p.fragranceNotes.heart.toLowerCase().includes(q) ||
        p.fragranceNotes.base.toLowerCase().includes(q) ||
        p.variants.some(v => v.barcode.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle direct Barcode Scanner / Enter key
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Search variants across all products
    for (const prod of products) {
      const match = prod.variants.find(
        v => v.barcode.toLowerCase() === query.toLowerCase() || v.sku.toLowerCase() === query.toLowerCase()
      );
      if (match) {
        const result = addToCart(prod, match, 1);
        if (result.success) {
          setBarcodeFeedback({ message: `Added ${prod.name} (${match.size}) to cart`, type: 'success' });
          setBarcodeInput('');
        } else {
          setBarcodeFeedback({ message: result.message || 'Cannot add out of stock item', type: 'error' });
        }
        setTimeout(() => setBarcodeFeedback(null), 3500);
        return;
      }
    }

    setBarcodeFeedback({ message: `No product found matching barcode "${query}"`, type: 'error' });
    setTimeout(() => setBarcodeFeedback(null), 3500);
  };

  // Get active variant for a product
  const getActiveVariant = (product: PerfumeProduct): PerfumeVariant => {
    const selectedId = selectedVariants[product.id];
    if (selectedId) {
      const found = product.variants.find(v => v.id === selectedId);
      if (found) return found;
    }
    // Default to 30ml if exists, else first
    const def30 = product.variants.find(v => v.size === '30ml');
    return def30 || product.variants[0];
  };

  const handleSelectVariant = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || undefined
    });

    setSelectedCustomer(created);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setShowAddCustomer(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Product Catalog & Fast Checkout Search (8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          
          {/* Barcode scanner input & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Product search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search scent, inspired brand, or perfume notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Barcode scanner quick gun input */}
              <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 sm:w-72">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="Scan / Type barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-amber-50/50 border border-amber-200 text-stone-900 rounded-lg text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-200 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  Scan
                </button>
              </form>
            </div>

            {/* Barcode Feedback banner */}
            {barcodeFeedback && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                barcodeFeedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {barcodeFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{barcodeFeedback.message}</span>
              </div>
            )}

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-amber-300 shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const activeVariant = getActiveVariant(product);
              const isOutOfStock = activeVariant.stock <= 0;
              const isLowStock = activeVariant.stock > 0 && activeVariant.stock <= activeVariant.reorderLevel;

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          // Resilient fallback container if image fails
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {/* Quiet category & concentration text */}
                      <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-amber-200 text-[10px] px-2 py-0.5 rounded font-medium">
                        {product.brand}
                      </div>

                      {product.isBestSeller && (
                        <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                          Best Seller
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                          <span>{product.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{product.concentration.split('(')[0]}</span>
                        </div>
                        <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-1">
                          {product.name}
                        </h3>
                      </div>

                      {/* Fragrance Notes */}
                      <div className="text-[11px] text-stone-500 line-clamp-1">
                        <span className="text-stone-400">Notes:</span> {product.fragranceNotes.heart}
                      </div>

                      {/* Variant Size Selector Buttons */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-medium text-stone-500 flex justify-between">
                          <span>Select Size:</span>
                          <span className={`font-mono-numbers ${isOutOfStock ? 'text-rose-600 font-semibold' : isLowStock ? 'text-amber-600 font-medium' : 'text-stone-500'}`}>
                            {isOutOfStock ? 'Out of stock' : `${activeVariant.stock} in stock`}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 rounded-lg">
                          {product.variants.map(v => {
                            const isSelected = v.id === activeVariant.id;
                            const hasNoStock = v.stock <= 0;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleSelectVariant(product.id, v.id)}
                                className={`py-1 text-center rounded text-xs font-medium transition-all ${
                                  isSelected
                                    ? 'bg-stone-900 text-amber-300 shadow-xs'
                                    : hasNoStock
                                      ? 'text-stone-400 line-through hover:bg-stone-200'
                                      : 'text-stone-700 hover:bg-stone-200'
                                }`}
                              >
                                {v.size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Add to Cart button */}
                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider">Selling Price</div>
                        <div className="text-lg font-bold font-mono-numbers text-stone-900">
                          ₱{activeVariant.sellingPrice.toFixed(2)}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product, activeVariant, 1)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                          isOutOfStock
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-stone-900 hover:bg-stone-800 text-amber-300'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
              <Search className="w-8 h-8 text-stone-300 mx-auto" />
              <div className="text-stone-600 font-medium">No fragrances match your search criteria.</div>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-xs text-amber-700 font-semibold underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Shopping Cart, Customer & Checkout Panel (4-5 cols on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-5 sticky top-20">
          
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Current Order</h2>
              <p className="text-xs text-stone-500">
                {cart.length === 0 ? 'Empty register cart' : `${cart.reduce((a, b) => a + b.quantity, 0)} item(s) selected`}
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Customer Selection & Loyalty */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-700">Customer &amp; Loyalty</span>
              <button
                type="button"
                onClick={() => setShowAddCustomer(true)}
                className="text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ New</span>
              </button>
            </div>

            <select
              aria-label="Select Customer"
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const found = customers.find(c => c.id === e.target.value) || null;
                setSelectedCustomer(found);
              }}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="">Walk-in Customer (No Loyalty Points)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier}) — {c.loyaltyPoints} Pts | {c.phone}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-900">
                  <Award className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="font-semibold">{selectedCustomer.name}</span>
                    <span className="text-amber-700 ml-1.5">({selectedCustomer.loyaltyPoints} points available)</span>
                  </div>
                </div>
                {selectedCustomer.loyaltyPoints > 0 && discount.type !== 'loyalty_points' && (
                  <button
                    type="button"
                    onClick={() => setDiscount({ type: 'loyalty_points', value: selectedCustomer.loyaltyPoints })}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-medium"
                  >
                    Redeem
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-stone-400 space-y-2">
                <Tag className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs">No items in cart. Click a perfume or scan a barcode to add.</p>
              </div>
            ) : (
              cart.map(item => (
                <div 
                  key={item.variantId}
                  className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-stone-900">{item.productName}</div>
                      <div className="text-stone-500 text-[11px]">
                        <span>{item.brand}</span>
                        <span className="mx-1">·</span>
                        <span className="font-medium text-stone-700">{item.size}</span>
                        <span className="mx-1">·</span>
                        <span className="font-mono-numbers text-stone-400">{item.barcode}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-md p-0.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.variantId, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:bg-stone-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => setCartQuantityExact(item.variantId, parseInt(e.target.value) || 1)}
                        className="w-8 text-center text-xs font-mono-numbers font-semibold text-stone-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.variantId, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:bg-stone-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Unit & Line Total */}
                    <div className="text-right">
                      <div className="text-[11px] text-stone-500 font-mono-numbers">
                        ₱{item.unitPrice.toFixed(2)} ea
                      </div>
                      <div className="font-bold text-stone-900 font-mono-numbers text-sm">
                        ₱{item.lineTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discounts & Promos */}
          <div className="space-y-1.5 pt-2 border-t border-stone-200">
            <span className="text-xs font-medium text-stone-700">Apply Discount</span>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDiscount({ type: 'none', value: 0 })}
                className={`py-1.5 px-2 rounded-lg text-center transition-colors font-medium ${
                  discount.type === 'none'
                    ? 'bg-stone-900 text-amber-300 font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => setDiscount({ type: 'promo_10', value: 10 })}
                className={`py-1.5 px-2 rounded-lg text-center transition-colors font-medium ${
                  discount.type === 'promo_10'
                    ? 'bg-stone-900 text-amber-300 font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                10% Off
              </button>
              <button
                type="button"
                onClick={() => setDiscount({ type: 'pwd_senior_20', value: 20 })}
                className={`py-1.5 px-2 rounded-lg text-center transition-colors font-medium ${
                  discount.type === 'pwd_senior_20'
                    ? 'bg-stone-900 text-amber-300 font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
                title="20% Senior Citizen / PWD Statutory Discount"
              >
                20% PWD
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = prompt('Enter fixed custom discount amount in PHP (₱):', '50');
                  if (val && !isNaN(parseFloat(val))) {
                    setDiscount({ type: 'custom', value: parseFloat(val) });
                  }
                }}
                className={`py-1.5 px-2 rounded-lg text-center transition-colors font-medium ${
                  discount.type === 'custom'
                    ? 'bg-stone-900 text-amber-300 font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Custom ₱
              </button>
            </div>
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-mono-numbers">₱{cartSubtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>
                    Discount (
                    {discount.type === 'pwd_senior_20' ? '20% Senior/PWD' :
                     discount.type === 'promo_10' ? '10% Promo' :
                     discount.type === 'loyalty_points' ? 'Loyalty Points' : 'Custom'}
                    )
                  </span>
                </span>
                <span className="font-mono-numbers">-₱{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-stone-900 font-semibold text-sm">TOTAL AMOUNT</span>
              <span className="text-2xl font-bold font-mono-numbers text-stone-950">
                ₱{cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Primary Action Button: Proceed to Payment */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
              cart.length === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-stone-950 active:scale-98'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay ₱{cartTotal.toLocaleString()}</span>
          </button>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-semibold text-stone-900 text-base">Register New Customer</h3>
              <button 
                onClick={() => setShowAddCustomer(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sofia Gonzales"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Mobile / GCash Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0917-123-4567"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. sofia@example.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg font-medium"
                >
                  Save &amp; Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Payment Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={(sale) => {
            setIsCheckoutOpen(false);
            setCompletedSale(sale);
          }}
        />
      )}

      {/* Thermal Receipt Print Modal */}
      {completedSale && (
        <ThermalReceipt
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};
