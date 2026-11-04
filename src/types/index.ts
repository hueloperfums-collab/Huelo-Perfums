export type PerfumeSize = '10ml' | '30ml' | '50ml' | '100ml' | 'Tester';

export type Category = 
  | 'Men'
  | 'Women'
  | 'Unisex'
  | 'Luxury'
  | 'Gourmand'
  | 'Fresh & Citrus'
  | 'Woody & Oriental';

export interface PerfumeVariant {
  id: string;
  size: PerfumeSize;
  costPrice: number;    // In PHP ₱
  sellingPrice: number; // In PHP ₱
  stock: number;        // Bottles on hand
  reorderLevel: number; // Alert threshold e.g. 5
  barcode: string;      // E.g. PERF-SAUV-30ML
  sku: string;
}

export interface PerfumeProduct {
  id: string;
  name: string;
  brand: string; // e.g. "Dior Inspired", "MFK Inspired", "Creed Inspired"
  category: Category;
  fragranceNotes: {
    top: string;
    heart: string;
    base: string;
  };
  concentration: 'Extrait de Parfum (30% Oil)' | 'Eau de Parfum (20% Oil)' | 'Eau de Toilette (15% Oil)';
  description: string;
  imageUrl: string;
  variants: PerfumeVariant[];
  isBestSeller?: boolean;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  brand: string;
  size: PerfumeSize;
  barcode: string;
  unitCost: number;
  unitPrice: number;
  quantity: number;
  discount: number; // per line item in ₱
  lineTotal: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number; // 1 point = ₱1 redemption value
  totalSpend: number;
  totalOrders: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  notes?: string;
  joinedDate: string;
}

export type PaymentMethod = 'cash' | 'gcash' | 'card' | 'split';

export interface SaleTransaction {
  id: string;
  invoiceNumber: string; // e.g. INV-20261103-0042
  timestamp: string;
  cashierName: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    pointsEarned: number;
    pointsRedeemed: number;
  };
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountType: 'none' | 'custom' | 'pwd_senior_20' | 'promo_10' | 'loyalty_points';
  taxAmount: number;
  total: number;
  totalCost: number; // Cost of Goods Sold
  grossProfit: number; // total - totalCost
  paymentMethod: PaymentMethod;
  paymentDetails: {
    cashReceived?: number;
    changeGiven?: number;
    gcashRef?: string;
    cardRef?: string;
    splitCash?: number;
    splitGcash?: number;
  };
  status: 'completed' | 'refunded';
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categoriesSupplied: string[];
  leadTimeDays: number;
}

export interface PurchaseOrderItem {
  productId: string;
  variantId: string;
  productName: string;
  size: PerfumeSize;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'received' | 'pending';
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  size: PerfumeSize;
  previousStock: number;
  newStock: number;
  difference: number;
  reason: 
    | 'Damaged bottle'
    | 'Tester / Display bottle'
    | 'Spillage during refill'
    | 'Inventory count variance'
    | 'Customer return to stock'
    | 'Other';
  date: string;
  user: string;
  notes: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 
    | 'Fragrance Oils'
    | 'Bottles & Sprayers'
    | 'Packaging & Boxes'
    | 'Alcohol & Solvents'
    | 'Rent & Utilities'
    | 'Salaries'
    | 'Marketing & Ads'
    | 'Store Maintenance'
    | 'Miscellaneous';
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'gcash' | 'card' | 'bank_transfer';
  referenceNumber?: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'alert';
}

export interface RegisterShift {
  id: string;
  cashier: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  cashSales: number;
  gcashSales: number;
  cardSales: number;
  expectedCash: number;
  actualCash?: number;
  discrepancy?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}
