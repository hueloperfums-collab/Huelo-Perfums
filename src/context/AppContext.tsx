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
import { 
  db, 
  auth,
  signInWithGoogle,
  signOutUser,
  testFirestoreConnection, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';

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
  firebaseUser: any | null;
  loginGoogle: () => Promise<void>;
  logoutGoogle: () => Promise<void>;
  isFirestoreSyncing: boolean;

  // Products & Stock
  products: PerfumeProduct[];
  addProduct: (product: PerfumeProduct) => Promise<void>;
  updateProduct: (product: PerfumeProduct) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  adjustVariantStock: (adjustment: Omit<StockAdjustment, 'id' | 'date' | 'user'>) => Promise<void>;
  processStockIn: (po: Omit<PurchaseOrder, 'id' | 'date'>) => Promise<void>;

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
  ) => Promise<SaleTransaction | null>;

  // Sales & Records
  sales: SaleTransaction[];
  refundSale: (saleId: string, reason: string) => Promise<void>;

  // Customers & Suppliers & Expenses
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpend' | 'totalOrders' | 'tier' | 'joinedDate'>) => Promise<Customer>;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date' | 'recordedBy'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Register Shift & Audit
  currentShift: RegisterShift;
  closeShift: (actualCash: number, notes?: string) => Promise<void>;
  openNewShift: (cashierName: string, openingFloat: number) => Promise<void>;
  auditLogs: AuditLog[];

  // Data Persistence & Tools
  exportSystemData: () => void;
  importSystemData: (jsonData: string) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [users] = useState<AppUser[]>(initialUsers);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-3'); // Default Camille Cruz (Cashier)
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  const loginGoogle = async () => {
    await signInWithGoogle();
  };

  const logoutGoogle = async () => {
    await signOutUser();
  };

  const currentUser = users.find(u => u.id === currentUserId) || users[2];

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    addAuditLog('User Switched', `Active user changed to ${users.find(u => u.id === userId)?.name}`, 'info');
  };

  // State initialized with fallbacks
  const [products, setProducts] = useState<PerfumeProduct[]>(initialProducts);
  const [sales, setSales] = useState<SaleTransaction[]>(initialSales);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [currentShift, setCurrentShift] = useState<RegisterShift>(initialShift);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState<DiscountConfig>({ type: 'none', value: 0 });

  // Firestore Real-Time Subscriptions & Bootstrapping
  useEffect(() => {
    testFirestoreConnection();

    // 1. PRODUCTS SUBSCRIPTION
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
        // Seed initial products to Firestore
        initialProducts.forEach(prod => {
          setDoc(doc(db, 'products', prod.id), prod).catch(err => 
            handleFirestoreError(err, OperationType.WRITE, `products/${prod.id}`)
          );
        });
      } else {
        const loaded: PerfumeProduct[] = [];
        snapshot.forEach(docSnap => loaded.push(docSnap.data() as PerfumeProduct));
        setProducts(loaded);
      }
      setIsFirestoreSyncing(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      setIsFirestoreSyncing(false);
    });

    // 2. SALES SUBSCRIPTION
    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      if (snapshot.empty) {
        initialSales.forEach(sale => {
          setDoc(doc(db, 'sales', sale.id), sale).catch(err =>
            handleFirestoreError(err, OperationType.WRITE, `sales/${sale.id}`)
          );
        });
      } else {
        const loaded: SaleTransaction[] = [];
        snapshot.forEach(docSnap => loaded.push(docSnap.data() as SaleTransaction));
        loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setSales(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sales');
    });

    // 3. CUSTOMERS SUBSCRIPTION
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      if (snapshot.empty) {
        initialCustomers.forEach(cust => {
          setDoc(doc(db, 'customers', cust.id), cust).catch(err =>
            handleFirestoreError(err, OperationType.WRITE, `customers/${cust.id}`)
          );
        });
      } else {
        const loaded: Customer[] = [];
        snapshot.forEach(docSnap => loaded.push(docSnap.data() as Customer));
        setCustomers(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'customers');
    });

    // 4. SUPPLIERS SUBSCRIPTION
    const unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snapshot) => {
      if (snapshot.empty) {
        initialSuppliers.forEach(supp => {
          setDoc(doc(db, 'suppliers', supp.id), supp).catch(err =>
            handleFirestoreError(err, OperationType.WRITE, `suppliers/${supp.id}`)
          );
        });
      } else {
        const loaded: Supplier[] = [];
        snapshot.forEach(docSnap => loaded.push(docSnap.data() as Supplier));
        setSuppliers(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'suppliers');
    });

    // 5. EXPENSES SUBSCRIPTION
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      if (snapshot.empty) {
        initialExpenses.forEach(exp => {
          setDoc(doc(db, 'expenses', exp.id), exp).catch(err =>
            handleFirestoreError(err, OperationType.WRITE, `expenses/${exp.id}`)
          );
        });
      } else {
        const loaded: Expense[] = [];
        snapshot.forEach(docSnap => loaded.push(docSnap.data() as Expense));
        loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'expenses');
    });

    // 6. SHIFTS SUBSCRIPTION
    const unsubShifts = onSnapshot(collection(db, 'shifts'), (snapshot) => {
      if (snapshot.empty) {
        setDoc(doc(db, 'shifts', initialShift.id), initialShift).catch(err =>
          handleFirestoreError(err, OperationType.WRITE, `shifts/${initialShift.id}`)
        );
      } else {
        const loaded: RegisterShift[] = [];
        snapshot.forEach(docSnap => loaded.push(docSnap.data() as RegisterShift));
        loaded.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
        if (loaded.length > 0) {
          setCurrentShift(loaded[0]);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'shifts');
    });

    // 7. AUDIT LOGS SUBSCRIPTION
    const unsubLogs = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
      if (snapshot.empty) {
        initialAuditLogs.forEach(log => {
          setDoc(doc(db, 'auditLogs', log.id), log).catch(err =>
            handleFirestoreError(err, OperationType.WRITE, `auditLogs/${log.id}`)
          );
        });
      } else {
        const loaded: AuditLog[] = [];
        snapshot.forEach(docSnap => loaded.push(docSnap.data() as AuditLog));
        loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'auditLogs');
    });

    return () => {
      unsubProducts();
      unsubSales();
      unsubCustomers();
      unsubSuppliers();
      unsubExpenses();
      unsubShifts();
      unsubLogs();
    };
  }, []);

  const addAuditLog = async (action: string, details: string, severity: 'info' | 'warning' | 'alert' = 'info') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action,
      details,
      severity
    };
    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${newLog.id}`);
    }
  };

  const addToCart = (product: PerfumeProduct, variant: PerfumeVariant, quantity: number = 1) => {
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

  // Complete Sale with Firestore Write
  const completeSale = async (
    paymentMethod: PaymentMethod,
    paymentDetails: SaleTransaction['paymentDetails'],
    notes?: string
  ): Promise<SaleTransaction | null> => {
    if (cart.length === 0) return null;

    const totalCost = cart.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
    const grossProfit = cartTotal - totalCost;

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

    try {
      // 1. Save Sale to Firestore
      await setDoc(doc(db, 'sales', newSale.id), newSale);

      // 2. Deduct Stock in Firestore for each product
      for (const prod of products) {
        const matchingCartItems = cart.filter(c => c.productId === prod.id);
        if (matchingCartItems.length > 0) {
          const updatedVariants = prod.variants.map(v => {
            const cartItem = matchingCartItems.find(c => c.variantId === v.id);
            if (cartItem) {
              return { ...v, stock: Math.max(0, v.stock - cartItem.quantity) };
            }
            return v;
          });
          const updatedProd = { ...prod, variants: updatedVariants };
          await setDoc(doc(db, 'products', prod.id), updatedProd);
        }
      }

      // 3. Update Customer in Firestore
      if (selectedCustomer) {
        const newPoints = Math.max(0, selectedCustomer.loyaltyPoints - pointsRedeemed + pointsEarned);
        const newSpend = selectedCustomer.totalSpend + cartTotal;
        let tier = selectedCustomer.tier;
        if (newSpend >= 10000) tier = 'VIP';
        else if (newSpend >= 5000) tier = 'Gold';
        else if (newSpend >= 2000) tier = 'Silver';

        const updatedCust: Customer = {
          ...selectedCustomer,
          loyaltyPoints: newPoints,
          totalSpend: newSpend,
          totalOrders: selectedCustomer.totalOrders + 1,
          tier
        };
        await setDoc(doc(db, 'customers', selectedCustomer.id), updatedCust);
      }

      // 4. Update Shift in Firestore
      let cashSales = currentShift.cashSales;
      let gcashSales = currentShift.gcashSales;
      let cardSales = currentShift.cardSales;

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

      const updatedShift: RegisterShift = {
        ...currentShift,
        cashSales,
        gcashSales,
        cardSales,
        expectedCash: currentShift.openingFloat + cashSales
      };
      await setDoc(doc(db, 'shifts', currentShift.id), updatedShift);

      // 5. Audit Log
      await addAuditLog('Sale Completed', `Processed ${invoiceNumber} for ₱${cartTotal.toLocaleString()} (${paymentMethod.toUpperCase()})`, 'info');

      clearCart();
      return newSale;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `sales/${newSale.id}`);
      return null;
    }
  };

  const refundSale = async (saleId: string, reason: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale || sale.status === 'refunded') return;

    try {
      // 1. Restore stock in Firestore
      for (const prod of products) {
        const matchingItems = sale.items.filter(i => i.productId === prod.id);
        if (matchingItems.length > 0) {
          const updatedVariants = prod.variants.map(v => {
            const item = matchingItems.find(i => i.variantId === v.id);
            if (item) {
              return { ...v, stock: v.stock + item.quantity };
            }
            return v;
          });
          await setDoc(doc(db, 'products', prod.id), { ...prod, variants: updatedVariants });
        }
      }

      // 2. Mark refunded
      const updatedSale = { ...sale, status: 'refunded' as const, notes: `Refunded: ${reason}` };
      await setDoc(doc(db, 'sales', saleId), updatedSale);

      await addAuditLog('Sale Refunded', `Refunded ${sale.invoiceNumber} - ${reason}`, 'warning');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `sales/${saleId}`);
    }
  };

  const adjustVariantStock = async (adj: Omit<StockAdjustment, 'id' | 'date' | 'user'>) => {
    const prod = products.find(p => p.id === adj.productId);
    if (!prod) return;

    const updatedVariants = prod.variants.map(v => {
      if (v.id === adj.variantId) {
        return { ...v, stock: adj.newStock };
      }
      return v;
    });

    try {
      await setDoc(doc(db, 'products', prod.id), { ...prod, variants: updatedVariants });
      await addAuditLog(
        'Stock Adjustment',
        `${adj.productName} (${adj.size}) changed by ${adj.difference > 0 ? '+' : ''}${adj.difference} (${adj.reason}). Now: ${adj.newStock}`,
        adj.reason === 'Damaged bottle' || adj.reason === 'Spillage during refill' ? 'warning' : 'info'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${prod.id}`);
    }
  };

  const processStockIn = async (po: Omit<PurchaseOrder, 'id' | 'date'>) => {
    try {
      for (const prod of products) {
        const poItemsForProd = po.items.filter(i => i.productId === prod.id);
        if (poItemsForProd.length > 0) {
          const updatedVariants = prod.variants.map(v => {
            const poItem = poItemsForProd.find(i => i.variantId === v.id);
            if (poItem) {
              return {
                ...v,
                stock: v.stock + poItem.quantity,
                costPrice: poItem.unitCost
              };
            }
            return v;
          });
          await setDoc(doc(db, 'products', prod.id), { ...prod, variants: updatedVariants });
        }
      }

      await addAuditLog(
        'Stock-In Received',
        `PO #${po.poNumber} from ${po.supplierName} - Received ${po.items.reduce((a, b) => a + b.quantity, 0)} bottles (₱${po.totalAmount.toLocaleString()})`,
        'info'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  const addProduct = async (product: PerfumeProduct) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      await addAuditLog('Product Added', `Added perfume ${product.name} with ${product.variants.length} size variants`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${product.id}`);
    }
  };

  const updateProduct = async (updated: PerfumeProduct) => {
    try {
      await setDoc(doc(db, 'products', updated.id), updated);
      await addAuditLog('Product Updated', `Updated product details for ${updated.name}`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${updated.id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    const prod = products.find(p => p.id === id);
    try {
      await deleteDoc(doc(db, 'products', id));
      await addAuditLog('Product Deleted', `Removed ${prod?.name || id} from catalog`, 'warning');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const addCustomer = async (data: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpend' | 'totalOrders' | 'tier' | 'joinedDate'>) => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      loyaltyPoints: 0,
      totalSpend: 0,
      totalOrders: 0,
      tier: 'Bronze',
      joinedDate: new Date().toISOString().slice(0, 10)
    };
    try {
      await setDoc(doc(db, 'customers', newCust.id), newCust);
      await addAuditLog('Customer Registered', `Created customer profile for ${newCust.name} (${newCust.phone})`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `customers/${newCust.id}`);
    }
    return newCust;
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    const newSupp: Supplier = {
      ...supplierData,
      id: `supp-${Date.now()}`
    };
    try {
      await setDoc(doc(db, 'suppliers', newSupp.id), newSupp);
      await addAuditLog('Supplier Added', `Registered supplier ${newSupp.name}`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `suppliers/${newSupp.id}`);
    }
  };

  const addExpense = async (expData: Omit<Expense, 'id' | 'date' | 'recordedBy'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      recordedBy: currentUser.name
    };
    try {
      await setDoc(doc(db, 'expenses', newExp.id), newExp);
      await addAuditLog('Expense Logged', `₱${newExp.amount.toLocaleString()} - ${newExp.category}: ${newExp.description}`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `expenses/${newExp.id}`);
    }
  };

  const deleteExpense = async (id: string) => {
    const exp = expenses.find(e => e.id === id);
    try {
      await deleteDoc(doc(db, 'expenses', id));
      await addAuditLog('Expense Deleted', `Removed expense ₱${exp?.amount} - ${exp?.description}`, 'warning');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `expenses/${id}`);
    }
  };

  const closeShift = async (actualCash: number, notes?: string) => {
    const discrepancy = actualCash - currentShift.expectedCash;
    const closed: RegisterShift = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      actualCash,
      discrepancy,
      status: 'closed',
      notes
    };
    try {
      await setDoc(doc(db, 'shifts', closed.id), closed);
      await addAuditLog(
        'Register Shift Closed',
        `Cashier ${currentShift.cashier} closed register. Expected Cash: ₱${currentShift.expectedCash.toLocaleString()}, Actual: ₱${actualCash.toLocaleString()} (Diff: ₱${discrepancy})`,
        discrepancy !== 0 ? 'alert' : 'info'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `shifts/${closed.id}`);
    }
  };

  const openNewShift = async (cashierName: string, openingFloat: number) => {
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
    try {
      await setDoc(doc(db, 'shifts', newShift.id), newShift);
      await addAuditLog('Register Shift Opened', `New shift by ${cashierName} with float ₱${openingFloat.toLocaleString()}`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `shifts/${newShift.id}`);
    }
  };

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
    a.download = `Huelo_Perfumes_Firestore_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('Data Backup', 'Exported complete database JSON archive', 'info');
  };

  const importSystemData = async (jsonData: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products && Array.isArray(parsed.products)) {
        for (const p of parsed.products) {
          await setDoc(doc(db, 'products', p.id), p);
        }
        if (parsed.sales && Array.isArray(parsed.sales)) {
          for (const s of parsed.sales) {
            await setDoc(doc(db, 'sales', s.id), s);
          }
        }
        if (parsed.customers && Array.isArray(parsed.customers)) {
          for (const c of parsed.customers) {
            await setDoc(doc(db, 'customers', c.id), c);
          }
        }
        if (parsed.suppliers && Array.isArray(parsed.suppliers)) {
          for (const sp of parsed.suppliers) {
            await setDoc(doc(db, 'suppliers', sp.id), sp);
          }
        }
        if (parsed.expenses && Array.isArray(parsed.expenses)) {
          for (const e of parsed.expenses) {
            await setDoc(doc(db, 'expenses', e.id), e);
          }
        }
        await addAuditLog('Data Restored', 'Imported database from backup JSON into Firestore', 'warning');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefaults = async () => {
    try {
      for (const p of initialProducts) {
        await setDoc(doc(db, 'products', p.id), p);
      }
      for (const s of initialSales) {
        await setDoc(doc(db, 'sales', s.id), s);
      }
      for (const c of initialCustomers) {
        await setDoc(doc(db, 'customers', c.id), c);
      }
      for (const sp of initialSuppliers) {
        await setDoc(doc(db, 'suppliers', sp.id), sp);
      }
      for (const e of initialExpenses) {
        await setDoc(doc(db, 'expenses', e.id), e);
      }
      await setDoc(doc(db, 'shifts', initialShift.id), initialShift);
      clearCart();
      await addAuditLog('System Reset', 'Demo database restored to default factory state in Firestore', 'alert');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'resetToDefaults');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        users,
        switchUser,
        firebaseUser,
        loginGoogle,
        logoutGoogle,
        isFirestoreSyncing,
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
