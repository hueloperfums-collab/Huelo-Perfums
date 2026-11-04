import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  PerfumeProduct, 
  PerfumeVariant, 
  CartItem, 
  Customer, 
  Supplier, 
  SaleTransaction, 
  Expense, 
  AuditLog, 
  RegisterShift, 
  AppUser, 
  StockAdjustment, 
  PurchaseOrder,
  PaymentMethod 
} from '../types';
import { 
  initialProducts, 
  initialCustomers, 
  initialSuppliers, 
  initialSales, 
  initialExpenses, 
  initialAuditLogs, 
  initialShift, 
  initialUsers 
} from '../data/initialData';

interface DiscountConfig {
  type: 'none' | 'custom' | 'pwd_senior_20' | 'promo_10' | 'loyalty_points';
  value: number; // in ₱ or %
}

interface AppContextType {
  // Navigation & User
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: AppUser;
  users: AppUser[];
  switchUser: (userId: string) => void;

  // Products & Stock
  products: PerfumeProduct[];
  addProduct: (product: PerfumeProduct) => void;
  updateProduct: (product: PerfumeProduct) => void;
  deleteProduct: (productId: string) => void;
  adjustVariantStock: (adjustment: Omit<StockAdjustment, 'id' | 'date' | 'user'>) => void;
  processStockIn: (po: Omit<PurchaseOrder, 'id' | 'date'>) => void;

  // Cart & POS
  cart: CartItem[];
  addToCart: (product: PerfumeProduct, variant: PerfumeVariant, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, delta: number) => void;
  setCartQuantityExact: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  discount: DiscountConfig;
  setDiscount: (d: DiscountConfig) => void;
  cartSubtotal: number;
  discountAmount: number;
  cartTotal: number;
  completeSale: (
    paymentMethod: PaymentMethod,
    paymentDetails: SaleTransaction['paymentDetails'],
    notes?: string
  ) => SaleTransaction | null;

  // Sales & Records
  sales: SaleTransaction[];
  refundSale: (saleId: string, reason: string) => void;

  // Customers & Suppliers & Expenses
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpend' | 'totalOrders' | 'tier' | 'joinedDate'>) => Customer;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date' | 'recordedBy'>) => void;
  deleteExpense: (id: string) => void;

  // Register Shift & Audit
  currentShift: RegisterShift;
  closeShift: (actualCash: number, notes?: string) => void;
  openNewShift: (cashierName: string, openingFloat: number) => void;
  auditLogs: AuditLog[];

  // Data Persistence & Tools
  exportSystemData: () => void;
  importSystemData: (jsonData: string) => boolean;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'aura_perfumes_products_v1',
  SALES: 'aura_perfumes_sales_v1',
  CUSTOMERS: 'aura_perfumes_customers_v1',
  SUPPLIERS: 'aura_perfumes_suppliers_v1',
  EXPENSES: 'aura_perfumes_expenses_v1',
  SHIFT: 'aura_perfumes_shift_v1',
  LOGS: 'aura_perfumes_logs_v1',
  CURRENT_USER_ID: 'aura_perfumes_user_id_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [users] = useState<AppUser[]>(initialUsers);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'usr-3'; // Default Camille Cruz (Cashier)
  });

  const currentUser = users.find(u => u.id === currentUserId) || users[2];

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    addAuditLog('User Switched', `Active user changed to ${users.find(u => u.id === userId)?.name}`, 'info');
  };

  // State with LocalStorage fallbacks
  const [products, setProducts] = useState<PerfumeProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [sales, setSales] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [currentShift, setCurrentShift] = useState<RegisterShift>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHIFT);
    return saved ? JSON.parse(saved) : initialShift;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(currentShift));
  }, [currentShift]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (action: string, details: string, severity: 'info' | 'warning' | 'alert' = 'info') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action,
      details,
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState<DiscountConfig>({ type: 'none', value: 0 });

  const addToCart = (product: PerfumeProduct, variant: PerfumeVariant, quantity: number = 1) => {
    // Check stock
    const existingIndex = cart.findIndex(item => item.variantId === variant.id);
    const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const requestedQty = currentQtyInCart + quantity;

    if (requestedQty > variant.stock) {
      return { 
        success: false, 
        message: `Insufficient stock for ${product.name} (${variant.size}). Only ${variant.stock} bottles available.` 
      };
    }

    if (existingIndex >= 0) {
      setCart(prev => {
        const next = [...prev];
        const item = next[existingIndex];
        const newQty = item.quantity + quantity;
        item.quantity = newQty;
        item.lineTotal = (item.unitPrice * newQty) - (item.discount * newQty);
        return next;
      });
    } else {
      const newItem: CartItem = {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        brand: product.brand,
        size: variant.size,
        barcode: variant.barcode,
        unitCost: variant.costPrice,
        unitPrice: variant.sellingPrice,
        quantity,
        discount: 0,
        lineTotal: variant.sellingPrice * quantity
      };
      setCart(prev => [...prev, newItem]);
    }
    return { success: true };
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateCartQuantity = (variantId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.variantId === variantId) {
          // Find stock
          const prod = products.find(p => p.id === item.productId);
          const variant = prod?.variants.find(v => v.id === variantId);
          const maxStock = variant ? variant.stock : 999;
          const nextQty = Math.max(1, Math.min(maxStock, item.quantity + delta));
          return {
            ...item,
            quantity: nextQty,
            lineTotal: (item.unitPrice * nextQty) - (item.discount * nextQty)
          };
        }
        return item;
      });
    });
  };

  const setCartQuantityExact = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prev => {
      return prev.map(item => {
        if (item.variantId === variantId) {
          const prod = products.find(p => p.id === item.productId);
          const variant = prod?.variants.find(v => v.id === variantId);
          const maxStock = variant ? variant.stock : 999;
          const nextQty = Math.min(maxStock, quantity);
          return {
            ...item,
            quantity: nextQty,
            lineTotal: (item.unitPrice * nextQty) - (item.discount * nextQty)
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount({ type: 'none', value: 0 });
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  
  let discountAmount = 0;
  if (discount.type === 'custom') {
    discountAmount = Math.min(cartSubtotal, discount.value);
  } else if (discount.type === 'promo_10') {
    discountAmount = Math.round(cartSubtotal * 0.10);
  } else if (discount.type === 'pwd_senior_20') {
    discountAmount = Math.round(cartSubtotal * 0.20);
  } else if (discount.type === 'loyalty_points') {
    const maxRedeem = selectedCustomer ? Math.min(selectedCustomer.loyaltyPoints, cartSubtotal) : 0;
    discountAmount = Math.min(discount.value, maxRedeem);
  }

  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Complete Sale
  const completeSale = (
    paymentMethod: PaymentMethod,
    paymentDetails: SaleTransaction['paymentDetails'],
    notes?: string
  ): SaleTransaction | null => {
    if (cart.length === 0) return null;

    const totalCost = cart.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
    const grossProfit = cartTotal - totalCost;

    // Award loyalty points: 1 point for every ₱50 spent
    const pointsEarned = Math.floor(cartTotal / 50);
    const pointsRedeemed = discount.type === 'loyalty_points' ? discountAmount : 0;

    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(sales.length + 1).padStart(4, '0')}`;

    const newSale: SaleTransaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber,
      timestamp: new Date().toISOString(),
      cashierName: currentUser.name,
      customer: selectedCustomer ? {
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        pointsEarned,
        pointsRedeemed
      } : undefined,
      items: [...cart],
      subtotal: cartSubtotal,
      discountAmount,
      discountType: discount.type,
      taxAmount: 0,
      total: cartTotal,
      totalCost,
      grossProfit,
      paymentMethod,
      paymentDetails,
      status: 'completed',
      notes
    };

    // 1. Deduct Stock from Products
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const matchingCartItems = cart.filter(c => c.productId === prod.id);
        if (matchingCartItems.length === 0) return prod;

        const updatedVariants = prod.variants.map(v => {
          const cartItem = matchingCartItems.find(c => c.variantId === v.id);
          if (cartItem) {
            return {
              ...v,
              stock: Math.max(0, v.stock - cartItem.quantity)
            };
          }
          return v;
        });

        return {
          ...prod,
          variants: updatedVariants
        };
      });
    });

    // 2. Update Customer Loyalty & Spend
    if (selectedCustomer) {
      setCustomers(prev => prev.map(c => {
        if (c.id === selectedCustomer.id) {
          const newPoints = Math.max(0, c.loyaltyPoints - pointsRedeemed + pointsEarned);
          const newSpend = c.totalSpend + cartTotal;
          let tier = c.tier;
          if (newSpend >= 10000) tier = 'VIP';
          else if (newSpend >= 5000) tier = 'Gold';
          else if (newSpend >= 2000) tier = 'Silver';

          return {
            ...c,
            loyaltyPoints: newPoints,
            totalSpend: newSpend,
            totalOrders: c.totalOrders + 1,
            tier
          };
        }
        return c;
      }));
    }

    // 3. Update Register Shift sales totals
    setCurrentShift(prev => {
      let cashSales = prev.cashSales;
      let gcashSales = prev.gcashSales;
      let cardSales = prev.cardSales;

      if (paymentMethod === 'cash') {
        cashSales += cartTotal;
      } else if (paymentMethod === 'gcash') {
        gcashSales += cartTotal;
      } else if (paymentMethod === 'card') {
        cardSales += cartTotal;
      } else if (paymentMethod === 'split') {
        cashSales += paymentDetails.splitCash || 0;
        gcashSales += paymentDetails.splitGcash || 0;
      }

      return {
        ...prev,
        cashSales,
        gcashSales,
        cardSales,
        expectedCash: prev.openingFloat + cashSales
      };
    });

    // 4. Save Sale & Log
    setSales(prev => [newSale, ...prev]);
    addAuditLog('Sale Completed', `Processed ${invoiceNumber} for ₱${cartTotal.toLocaleString()} (${paymentMethod.toUpperCase()})`, 'info');

    // Clear cart
    clearCart();
    return newSale;
  };

  const refundSale = (saleId: string, reason: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale || sale.status === 'refunded') return;

    // Restore stock
    setProducts(prev => {
      return prev.map(prod => {
        const matchingItems = sale.items.filter(i => i.productId === prod.id);
        if (matchingItems.length === 0) return prod;
        return {
          ...prod,
          variants: prod.variants.map(v => {
            const item = matchingItems.find(i => i.variantId === v.id);
            if (item) {
              return { ...v, stock: v.stock + item.quantity };
            }
            return v;
          })
        };
      });
    });

    // Update sale status
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'refunded', notes: `Refunded: ${reason}` } : s));
    addAuditLog('Sale Refunded', `Refunded ${sale.invoiceNumber} - ${reason}`, 'warning');
  };

  // Stock Adjustment
  const adjustVariantStock = (adj: Omit<StockAdjustment, 'id' | 'date' | 'user'>) => {
    setProducts(prev => {
      return prev.map(prod => {
        if (prod.id !== adj.productId) return prod;
        return {
          ...prod,
          variants: prod.variants.map(v => {
            if (v.id === adj.variantId) {
              return { ...v, stock: adj.newStock };
            }
            return v;
          })
        };
      });
    });

    addAuditLog(
      'Stock Adjustment',
      `${adj.productName} (${adj.size}) changed by ${adj.difference > 0 ? '+' : ''}${adj.difference} (${adj.reason}). Now: ${adj.newStock}`,
      adj.reason === 'Damaged bottle' || adj.reason === 'Spillage during refill' ? 'warning' : 'info'
    );
  };

  // Stock In / Purchase Order
  const processStockIn = (po: Omit<PurchaseOrder, 'id' | 'date'>) => {
    setProducts(prev => {
      return prev.map(prod => {
        const poItemsForProd = po.items.filter(i => i.productId === prod.id);
        if (poItemsForProd.length === 0) return prod;

        return {
          ...prod,
          variants: prod.variants.map(v => {
            const poItem = poItemsForProd.find(i => i.variantId === v.id);
            if (poItem) {
              return {
                ...v,
                stock: v.stock + poItem.quantity,
                costPrice: poItem.unitCost // update latest cost
              };
            }
            return v;
          })
        };
      });
    });

    addAuditLog(
      'Stock-In Received',
      `PO #${po.poNumber} from ${po.supplierName} - Received ${po.items.reduce((a, b) => a + b.quantity, 0)} bottles (₱${po.totalAmount.toLocaleString()})`,
      'info'
    );
  };

  // Products CRUD
  const addProduct = (product: PerfumeProduct) => {
    setProducts(prev => [product, ...prev]);
    addAuditLog('Product Added', `Added perfume ${product.name} with ${product.variants.length} size variants`, 'info');
  };

  const updateProduct = (updated: PerfumeProduct) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    addAuditLog('Product Updated', `Updated product details for ${updated.name}`, 'info');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    addAuditLog('Product Deleted', `Removed ${prod?.name || id} from catalog`, 'warning');
  };

  // Customers
  const addCustomer = (data: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpend' | 'totalOrders' | 'tier' | 'joinedDate'>) => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      loyaltyPoints: 0,
      totalSpend: 0,
      totalOrders: 0,
      tier: 'Bronze',
      joinedDate: new Date().toISOString().slice(0, 10)
    };
    setCustomers(prev => [newCust, ...prev]);
    addAuditLog('Customer Registered', `Created customer profile for ${newCust.name} (${newCust.phone})`, 'info');
    return newCust;
  };

  // Suppliers
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupp: Supplier = {
      ...supplierData,
      id: `supp-${Date.now()}`
    };
    setSuppliers(prev => [...prev, newSupp]);
    addAuditLog('Supplier Added', `Registered supplier ${newSupp.name}`, 'info');
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id' | 'date' | 'recordedBy'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      recordedBy: currentUser.name
    };
    setExpenses(prev => [newExp, ...prev]);
    addAuditLog('Expense Logged', `₱${newExp.amount.toLocaleString()} - ${newExp.category}: ${newExp.description}`, 'info');
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    addAuditLog('Expense Deleted', `Removed expense ₱${exp?.amount} - ${exp?.description}`, 'warning');
  };

  // Shift Register
  const closeShift = (actualCash: number, notes?: string) => {
    const discrepancy = actualCash - currentShift.expectedCash;
    setCurrentShift(prev => ({
      ...prev,
      closedAt: new Date().toISOString(),
      actualCash,
      discrepancy,
      status: 'closed',
      notes
    }));

    addAuditLog(
      'Register Shift Closed',
      `Cashier ${currentShift.cashier} closed register. Expected Cash: ₱${currentShift.expectedCash.toLocaleString()}, Actual: ₱${actualCash.toLocaleString()} (Diff: ₱${discrepancy})`,
      discrepancy !== 0 ? 'alert' : 'info'
    );
  };

  const openNewShift = (cashierName: string, openingFloat: number) => {
    const newShift: RegisterShift = {
      id: `shift-${Date.now()}`,
      cashier: cashierName,
      openedAt: new Date().toISOString(),
      openingFloat,
      cashSales: 0,
      gcashSales: 0,
      cardSales: 0,
      expectedCash: openingFloat,
      status: 'open',
      notes: `Opened by ${cashierName} with float ₱${openingFloat.toLocaleString()}`
    };
    setCurrentShift(newShift);
    addAuditLog('Register Shift Opened', `New shift by ${cashierName} with float ₱${openingFloat.toLocaleString()}`, 'info');
  };

  // Backup & Restore
  const exportSystemData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      products,
      sales,
      customers,
      suppliers,
      expenses,
      currentShift,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aura_Perfume_POS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('Data Backup', 'Exported complete database JSON archive', 'info');
  };

  const importSystemData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products && Array.isArray(parsed.products)) {
        setProducts(parsed.products);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.currentShift) setCurrentShift(parsed.currentShift);
        addAuditLog('Data Restored', 'Imported database from backup JSON', 'warning');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefaults = () => {
    setProducts(initialProducts);
    setSales(initialSales);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setExpenses(initialExpenses);
    setAuditLogs(initialAuditLogs);
    setCurrentShift(initialShift);
    clearCart();
    addAuditLog('System Reset', 'Demo database restored to default factory state', 'alert');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        users,
        switchUser,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustVariantStock,
        processStockIn,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        setCartQuantityExact,
        clearCart,
        selectedCustomer,
        setSelectedCustomer,
        discount,
        setDiscount,
        cartSubtotal,
        discountAmount,
        cartTotal,
        completeSale,
        sales,
        refundSale,
        customers,
        addCustomer,
        suppliers,
        addSupplier,
        expenses,
        addExpense,
        deleteExpense,
        currentShift,
        closeShift,
        openNewShift,
        auditLogs,
        exportSystemData,
        importSystemData,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
