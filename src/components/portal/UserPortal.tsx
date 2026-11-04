import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerfumeProduct, PerfumeVariant, PerfumeSize, Category, OnlineOrderItem, OnlineOrder } from '../../types';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Phone, 
  MapPin, 
  Truck, 
  Store, 
  ArrowRight, 
  X, 
  Plus, 
  Minus, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Filter,
  PackageCheck,
  CreditCard,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export const UserPortal: React.FC = () => {
  const { 
    products, 
    currentUser, 
    firebaseUser, 
    isLoggedIn,
    login,
    logout,
    placeOnlineOrder, 
    orders, 
    setActiveTab,
    storeSettings,
    users,
    switchUser
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Selected variant per product map: { [productId]: variantId }
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: string }>({});

  // Customer Cart: items in the user portal bag
  const [portalCart, setPortalCart] = useState<OnlineOrderItem[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OnlineOrder | null>(null);

  // Checkout form fields
  const [customerName, setCustomerName] = useState(currentUser.name || firebaseUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser.email || firebaseUser?.email || '');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'cash_on_delivery' | 'store_pickup_cash'>('gcash');
  const [paymentReference, setPaymentReference] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: string[] = [
    'All',
    'Men',
    'Women',
    'Unisex',
    'Luxury',
    'Gourmand',
    'Fresh & Citrus',
    'Woody & Oriental'
  ];

  // Helper to get active variant for a product
  const getActiveVariant = (product: PerfumeProduct): PerfumeVariant | undefined => {
    const selectedId = selectedVariants[product.id];
    if (selectedId) {
      const match = product.variants.find(v => v.id === selectedId);
      if (match) return match;
    }
    // Default to first variant with stock, or just first variant
    return product.variants.find(v => v.stock > 0) || product.variants[0];
  };

  const handleSelectVariant = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
  };

  // Add item to customer bag
  const handleAddToBag = (product: PerfumeProduct) => {
    const variant = getActiveVariant(product);
    if (!variant) return;

    if (variant.stock <= 0) {
      alert(`Sorry, ${product.name} in ${variant.size} is currently out of stock.`);
      return;
    }

    setPortalCart(prev => {
      const existingIndex = prev.findIndex(item => item.variantId === variant.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        const existing = next[existingIndex];
        if (existing.quantity >= variant.stock) {
          alert(`Only ${variant.stock} bottles available for ${product.name} (${variant.size}).`);
          return prev;
        }
        const updatedQty = existing.quantity + 1;
        next[existingIndex] = {
          ...existing,
          quantity: updatedQty,
          lineTotal: existing.unitPrice * updatedQty
        };
        return next;
      } else {
        const newItem: OnlineOrderItem = {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          brand: product.brand,
          size: variant.size,
          imageUrl: product.imageUrl,
          unitPrice: variant.sellingPrice,
          quantity: 1,
          lineTotal: variant.sellingPrice
        };
        return [...prev, newItem];
      }
    });

    // Provide quick tactile bag opening if first item
    setIsBagOpen(true);
  };

  const updateBagQuantity = (variantId: string, delta: number) => {
    setPortalCart(prev => {
      return prev.map(item => {
        if (item.variantId === variantId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            lineTotal: item.unitPrice * newQty
          };
        }
        return item;
      }).filter(Boolean) as OnlineOrderItem[];
    });
  };

  const removeBagItem = (variantId: string) => {
    setPortalCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  // Cart calculations
  const bagSubtotal = portalCart.reduce((sum, item) => sum + item.lineTotal, 0);
  const standardFee = storeSettings?.standardDeliveryFee ?? 100;
  const freeThreshold = storeSettings?.freeDeliveryThreshold ?? 1500;
  const deliveryFee = deliveryType === 'delivery' ? (bagSubtotal >= freeThreshold ? 0 : standardFee) : 0;
  const bagTotal = bagSubtotal + deliveryFee;
  const totalItemCount = portalCart.reduce((sum, item) => sum + item.quantity, 0);

  // Filtered perfumes
  const filteredProducts = products.filter(p => {
    if (!p.active) return false;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fragranceNotes.top.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fragranceNotes.heart.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fragranceNotes.base.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Submit Online Order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (portalCart.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Please enter your contact phone number.');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('Please provide your complete delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await placeOnlineOrder({
        userId: currentUser.id || firebaseUser?.uid || 'guest-user',
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'customer@gmail.com',
        customerPhone: customerPhone.trim(),
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        items: portalCart,
        subtotal: bagSubtotal,
        deliveryFee,
        total: bagTotal,
        notes: orderNotes.trim() || undefined
      });

      // Clear bag and open confirmation
      setPortalCart([]);
      setIsBagOpen(false);
      setOrderSuccess(order);
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('An error occurred while submitting your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer's past orders
  const myOrders = orders.filter(o => 
    o.userId === currentUser.id || 
    (currentUser.email && o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase()) ||
    (firebaseUser?.email && o.customerEmail?.toLowerCase() === firebaseUser?.email?.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* Top Banner & Customer Header */}
      <div className="bg-stone-900 text-stone-100 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif-luxury tracking-widest text-lg font-bold text-amber-200">
              HUELO PERFUMES
            </span>
            <span className="text-stone-600 hidden sm:inline">|</span>
            <span className="text-xs text-stone-300 hidden sm:inline">
              Online Fragrance Boutique &amp; Direct Ordering
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* If staff user, allow return to POS */}
            {(currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'cashier') && (
              <button
                onClick={() => setActiveTab('pos')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg font-medium border border-stone-700 transition-colors"
                title="Return to Staff Backoffice"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Switch to Staff POS</span>
              </button>
            )}

            {/* My Orders Button */}
            <button
              onClick={() => setIsOrdersModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-medium transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>My Orders</span>
              {myOrders.length > 0 && (
                <span className="bg-amber-400 text-stone-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {myOrders.length}
                </span>
              )}
            </button>

            {/* User Authentication Status & Log Out / Log In */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 bg-stone-800/90 px-2.5 py-1.5 rounded-lg border border-stone-700">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left text-[11px] leading-tight max-w-[130px]">
                  <span className="text-stone-200 font-semibold truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-stone-400 text-[10px] uppercase font-mono">
                    {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'manager' ? 'Manager' : currentUser.role === 'cashier' ? 'Cashier' : 'Customer'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Nais mo bang mag-Log Out sa iyong account?')) {
                      logout();
                    }
                  }}
                  className="flex items-center gap-1 text-rose-300 hover:text-rose-200 bg-rose-950/60 hover:bg-rose-900/80 px-2 py-1 rounded border border-rose-800/60 font-semibold text-xs ml-1 transition-colors"
                  title="Mag-Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded-lg transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsBagOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded-lg shadow-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bag ({totalItemCount})</span>
              <span className="font-mono text-xs">· ₱{bagSubtotal.toLocaleString()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-stone-100 py-12 px-4 border-b border-stone-800">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extrait de Parfum · 30% Fragrance Oil Concentration</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold tracking-tight text-stone-50">
            Artisanal Scents Crafted to Captivate
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
            Discover our luxury inspired perfume creations. Long-lasting, French-graded oils in 10ml, 30ml, 50ml, and 100ml bottles. Order online for swift nationwide courier delivery or store pickup.
          </p>

          {/* Search bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search perfumes, brands, or notes (e.g., Sauvage, Bergamot, Vanilla)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-stone-800/90 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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

      {/* Main Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-stone-900">{filteredProducts.length}</strong> perfume creations
          </p>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Free delivery on orders over ₱1,500</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 max-w-md mx-auto p-8 shadow-xs">
            <Search className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900">No fragrances found</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search terms or selecting a different category.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 bg-stone-900 text-amber-300 text-xs font-bold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const activeVariant = getActiveVariant(product);
              const inStock = (activeVariant?.stock || 0) > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  {/* Image & Badges */}
                  <div>
                    <div className="relative aspect-square w-full bg-stone-100 overflow-hidden group">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to placeholder if broken image
                          (e.target as HTMLImageElement).src = '/src/assets/images/perfume_noir_marble_1793767551333.jpg';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                        {product.isBestSeller && (
                          <span className="px-2.5 py-1 bg-amber-400 text-stone-950 font-bold text-[10px] rounded-md shadow-xs uppercase tracking-wider">
                            Best Seller
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-stone-900/80 backdrop-blur-xs text-stone-200 text-[10px] font-medium rounded-md">
                          {product.category}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-bold rounded-md shadow-xs font-mono">
                          {product.concentration.includes('30%') ? 'Extrait 30%' : 'EDP 20%'}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                          {product.brand}
                        </div>
                        <h3 className="text-base font-serif-luxury font-bold text-stone-900 leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Fragrance Notes Pills */}
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-[11px] space-y-1">
                        <div className="flex items-start gap-1 text-stone-700">
                          <span className="font-semibold text-stone-900 shrink-0">Top:</span>
                          <span className="text-stone-600 truncate">{product.fragranceNotes.top}</span>
                        </div>
                        <div className="flex items-start gap-1 text-stone-700">
                          <span className="font-semibold text-stone-900 shrink-0">Heart:</span>
                          <span className="text-stone-600 truncate">{product.fragranceNotes.heart}</span>
                        </div>
                        <div className="flex items-start gap-1 text-stone-700">
                          <span className="font-semibold text-stone-900 shrink-0">Base:</span>
                          <span className="text-stone-600 truncate">{product.fragranceNotes.base}</span>
                        </div>
                      </div>

                      {/* Size Variant Picker */}
                      <div>
                        <span className="text-[11px] font-semibold text-stone-700 block mb-1.5">
                          Select Bottle Size:
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {product.variants.map(v => {
                            const isSelected = activeVariant?.id === v.id;
                            const isAvailable = v.stock > 0;

                            return (
                              <button
                                key={v.id}
                                onClick={() => handleSelectVariant(product.id, v.id)}
                                className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                                  isSelected
                                    ? 'bg-stone-900 text-amber-300 font-bold border-2 border-stone-900'
                                    : isAvailable
                                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                                    : 'bg-stone-100 text-stone-400 opacity-60 border border-dashed border-stone-200'
                                }`}
                              >
                                <div className="text-[11px]">{v.size}</div>
                                <div className="text-[10px] font-mono">₱{v.sellingPrice}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Footer */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 mb-3">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase tracking-wider">
                          Price ({activeVariant?.size || 'Standard'})
                        </span>
                        <span className="text-xl font-bold font-mono text-stone-900">
                          ₱{activeVariant?.sellingPrice.toLocaleString() || 0}
                        </span>
                      </div>

                      <div className="text-right">
                        {inStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {activeVariant && activeVariant.stock <= 5 
                              ? `Only ${activeVariant.stock} left!` 
                              : 'In Stock'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-medium">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToBag(product)}
                      disabled={!inStock}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        inStock
                          ? 'bg-stone-900 hover:bg-stone-800 text-amber-300 shadow-xs active:scale-[0.98]'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{inStock ? 'Add to Bag' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SHOPPING BAG DRAWER / MODAL */}
      {isBagOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 bg-stone-900 text-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-serif-luxury font-bold">Your Fragrance Bag</h2>
                <span className="bg-amber-400 text-stone-900 text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalItemCount}
                </span>
              </div>
              <button
                onClick={() => setIsBagOpen(false)}
                className="p-1 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bag Items & Checkout Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {portalCart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-stone-900">Your bag is empty</h3>
                  <p className="text-xs text-stone-500 mt-1">Explore our perfumes and add your favorite scents.</p>
                  <button
                    onClick={() => setIsBagOpen(false)}
                    className="mt-4 px-4 py-2 bg-stone-900 text-amber-300 text-xs font-bold rounded-lg"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items list */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                      Selected Fragrances ({portalCart.length})
                    </h3>
                    {portalCart.map(item => (
                      <div key={item.variantId} className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="w-12 h-12 bg-stone-200 rounded-lg overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-stone-600">HP</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-stone-900 truncate">{item.productName}</h4>
                          <p className="text-[11px] text-stone-500">{item.size} · ₱{item.unitPrice.toLocaleString()} each</p>
                          <div className="text-xs font-mono font-bold text-stone-900 mt-0.5">
                            ₱{item.lineTotal.toLocaleString()}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-1">
                          <button
                            onClick={() => updateBagQuantity(item.variantId, -1)}
                            className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateBagQuantity(item.variantId, 1)}
                            className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeBagItem(item.variantId)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4 border-t border-stone-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                        Customer &amp; Fulfillment Details
                      </h3>
                      {!isLoggedIn && (
                        <button
                          type="button"
                          onClick={() => setIsLoginModalOpen(true)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline"
                        >
                          Mag-Log In para sa mabilis na checkout
                        </button>
                      )}
                    </div>

                    {!isLoggedIn && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="text-amber-900 leading-snug">
                          <span className="font-bold">May account ka na ba?</span> Mag-Log In para ma-save ang address at ma-track ang order sa My Orders.
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsLoginModalOpen(true)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded-lg shrink-0 transition-colors shadow-xs"
                        >
                          Log In
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="0917-123-4567"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="customer@gmail.com"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Delivery Method Choice */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Fulfillment Option</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryType('delivery')}
                          className={`p-2.5 rounded-lg border text-left flex items-center gap-2 text-xs transition-all ${
                            deliveryType === 'delivery'
                              ? 'border-stone-900 bg-stone-900 text-amber-300 font-bold'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <Truck className="w-4 h-4 shrink-0" />
                          <div>
                            <div>Standard Delivery</div>
                            <div className="text-[10px] font-normal opacity-80">
                              {bagSubtotal >= freeThreshold ? 'FREE' : `+₱${standardFee}`}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryType('pickup')}
                          className={`p-2.5 rounded-lg border text-left flex items-center gap-2 text-xs transition-all ${
                            deliveryType === 'pickup'
                              ? 'border-stone-900 bg-stone-900 text-amber-300 font-bold'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <Store className="w-4 h-4 shrink-0" />
                          <div>
                            <div>Store Pickup</div>
                            <div className="text-[10px] font-normal opacity-80">Free pickup</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {deliveryType === 'delivery' && (
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Complete Delivery Address *</label>
                        <textarea
                          required
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="House / Unit No., Street, Barangay, City, Province, Postal Code"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Payment Method */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      >
                        <option value="gcash">GCash (Online Transfer)</option>
                        <option value="cash_on_delivery">Cash on Delivery (COD)</option>
                        <option value="store_pickup_cash">Pay Cash at Store</option>
                      </select>

                      {paymentMethod === 'gcash' && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1.5">
                          <p className="text-blue-900 font-bold">GCash Payment Details:</p>
                          <p className="text-blue-800">Account: <strong>{storeSettings.gcashAccountName || 'HUELO PERFUMES OFFICIAL'}</strong></p>
                          <p className="text-blue-800">GCash No: <strong>{storeSettings.gcashNumber || '0917-888-4835'}</strong></p>
                          <div>
                            <input
                              type="text"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              placeholder="GCash Reference No. (optional / if already sent)"
                              className="w-full mt-1 px-2.5 py-1.5 bg-white border border-blue-300 rounded text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Order Notes / Requests</label>
                      <input
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Gift bag requested, deliver in morning, etc."
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Drawer Footer & Checkout Button */}
            {portalCart.length > 0 && (
              <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₱{bagSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Fee:</span>
                    <span className="font-mono">
                      {deliveryFee === 0 ? 'FREE' : `₱${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total Amount:</span>
                    <span className="font-mono text-amber-900">₱{bagTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckoutSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-stone-400"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Placing Order...' : `Place Order (₱${bagTotal.toLocaleString()})`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDER SUCCESS MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Order Confirmed</span>
              <h2 className="text-2xl font-serif-luxury font-bold text-stone-900 mt-1">Scent on Its Way!</h2>
              <p className="text-xs text-stone-500 mt-1">
                Thank you for choosing Huelo Perfumes. We received your order and are preparing your bottles.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-left space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500">Order No:</span>
                <span className="font-bold text-stone-900">{orderSuccess.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total:</span>
                <span className="font-bold text-stone-900">₱{orderSuccess.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Fulfillment:</span>
                <span className="text-stone-800 capitalize">{orderSuccess.deliveryType}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setIsOrdersModalOpen(true);
                }}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
              >
                Track in My Orders
              </button>
              <button
                onClick={() => setOrderSuccess(null)}
                className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MY ORDERS TRACKER MODAL */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="p-5 bg-stone-900 text-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-luxury font-bold text-base">My Order History</h3>
              </div>
              <button onClick={() => setIsOrdersModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {myOrders.length === 0 ? (
                <div className="text-center py-12">
                  <PackageCheck className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-800">No past orders found</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Orders placed with this account will automatically show here with live updates.
                  </p>
                </div>
              ) : (
                myOrders.map(ord => (
                  <div key={ord.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-stone-900">{ord.orderNumber}</span>
                        <p className="text-[11px] text-stone-500">{new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'preparing' ? 'bg-indigo-100 text-indigo-800' :
                        ord.status === 'confirmed' ? 'bg-sky-100 text-sky-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-stone-600">
                          <span>{it.quantity}x {it.productName} ({it.size})</span>
                          <span className="font-mono">₱{it.lineTotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs">
                      <span className="text-stone-500 capitalize">{ord.deliveryType} · {ord.paymentMethod.replace(/_/g, ' ')}</span>
                      <span className="font-bold font-mono text-stone-900">Total: ₱{ord.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-stone-100 border-t border-stone-200 text-right">
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="px-4 py-2 bg-stone-900 text-amber-300 text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED LOG IN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 bg-stone-900 text-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-luxury font-bold text-base">Log In · HUELO PERFUMES</h3>
              </div>
              <button 
                onClick={() => setIsLoginModalOpen(false)} 
                className="text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-2 font-bold text-base">
                  HP
                </div>
                <h4 className="text-lg font-serif-luxury font-bold text-stone-900">Mag-Log In sa HUELO PERFUMES</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Mag-sign in gamit ang iyong Gmail account. Awtomatikong magiging Customer / User ang role para sa agarang pag-order at live tracking.
                </p>
              </div>

              {/* Main Log In Action with Gmail */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoginModalOpen(false);
                    await login();
                  }}
                  className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-6.1z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.5L1.6 15.7C3.5 19.5 7.4 23 12 23z"/>
                  </svg>
                  <span>Log In gamit ang Gmail</span>
                </button>
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-center text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">Awtomatikong User Role:</span> Lahat ng bagong log in ay agad na magiging aktibong customer. Ang <span className="font-mono text-stone-700">hueloperfums@gmail.com</span> ay mananatiling Administrator.
                </div>
              </div>

              {/* Staff Demo Quick Access (For Evaluation & Testing) */}
              <div className="pt-4 border-t border-stone-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2 text-center">
                  O pumili ng Demo Staff Account (Testing)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {users.filter(u => u.role !== 'user').slice(0, 3).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        switchUser(u.id);
                        setIsLoginModalOpen(false);
                      }}
                      className="p-2 rounded-lg border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition-colors"
                    >
                      <div className="text-[11px] font-bold text-stone-800 truncate">{u.name.split(' ')[0]}</div>
                      <div className="text-[10px] uppercase font-mono text-amber-700 font-bold">{u.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium"
              >
                Isara / Magpatuloy bilang Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
