import { PerfumeProduct, Customer, Supplier, SaleTransaction, Expense, AuditLog, RegisterShift, AppUser } from '../types';

export const initialUsers: AppUser[] = [
  { id: 'usr-1', name: 'Althea Ramos (Owner)', role: 'admin', email: 'hueloperfums@gmail.com', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-2', name: 'Marcus Tan', role: 'manager', email: 'manager@hueloperfumes.ph', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-3', name: 'Camille Cruz', role: 'cashier', email: 'cashier@hueloperfumes.ph', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
];

export const initialProducts: PerfumeProduct[] = [
  {
    id: 'prod-sauvage',
    name: 'Sauvage Inspired',
    brand: 'Dior Inspired',
    category: 'Men',
    concentration: 'Extrait de Parfum (30% Oil)',
    fragranceNotes: {
      top: 'Calabrian Bergamot, Spicy Pepper',
      heart: 'Sichuan Pepper, Lavender, Pink Pepper, Vetiver',
      base: 'Ambroxan, Cedarwood, Labdanum'
    },
    description: 'Crisp raw freshness anchored by rich woody ambroxan. An unmistakable masculine signature bestseller.',
    imageUrl: '/src/assets/images/perfume_noir_marble_1793767551333.jpg',
    isBestSeller: true,
    active: true,
    createdAt: '2026-01-15T09:00:00Z',
    variants: [
      { id: 'var-sauv-10', size: '10ml', costPrice: 50, sellingPrice: 150, stock: 18, reorderLevel: 5, barcode: 'PERF-SAUV-10ML', sku: 'SV-10' },
      { id: 'var-sauv-30', size: '30ml', costPrice: 120, sellingPrice: 280, stock: 25, reorderLevel: 5, barcode: 'PERF-SAUV-30ML', sku: 'SV-30' },
      { id: 'var-sauv-50', size: '50ml', costPrice: 180, sellingPrice: 420, stock: 4, reorderLevel: 5, barcode: 'PERF-SAUV-50ML', sku: 'SV-50' }, // Low stock 1
      { id: 'var-sauv-100', size: '100ml', costPrice: 290, sellingPrice: 750, stock: 8, reorderLevel: 3, barcode: 'PERF-SAUV-100ML', sku: 'SV-100' },
    ]
  },
  {
    id: 'prod-baccarat',
    name: 'Baccarat Rouge 540 Inspired',
    brand: 'MFK Inspired',
    category: 'Luxury',
    concentration: 'Extrait de Parfum (30% Oil)',
    fragranceNotes: {
      top: 'Jasmine, Saffron, Bitter Almond',
      heart: 'Cedarwood, Amberwood, Egyptian Jasmine',
      base: 'Fir Resin, Ambergris, Musk'
    },
    description: 'Luminous and intense, laying on the skin like an amber floral and woody breeze.',
    imageUrl: '/src/assets/images/perfume_amber_luxury_1793767551103.jpg',
    isBestSeller: true,
    active: true,
    createdAt: '2026-01-15T09:30:00Z',
    variants: [
      { id: 'var-br540-10', size: '10ml', costPrice: 65, sellingPrice: 180, stock: 15, reorderLevel: 5, barcode: 'PERF-BR540-10ML', sku: 'BR-10' },
      { id: 'var-br540-30', size: '30ml', costPrice: 140, sellingPrice: 320, stock: 22, reorderLevel: 5, barcode: 'PERF-BR540-30ML', sku: 'BR-30' },
      { id: 'var-br540-50', size: '50ml', costPrice: 210, sellingPrice: 490, stock: 3, reorderLevel: 5, barcode: 'PERF-BR540-50ML', sku: 'BR-50' }, // Low stock 2
      { id: 'var-br540-100', size: '100ml', costPrice: 340, sellingPrice: 850, stock: 9, reorderLevel: 3, barcode: 'PERF-BR540-100ML', sku: 'BR-100' },
    ]
  },
  {
    id: 'prod-aventus',
    name: 'Aventus Inspired',
    brand: 'Creed Inspired',
    category: 'Men',
    concentration: 'Extrait de Parfum (30% Oil)',
    fragranceNotes: {
      top: 'Pineapple, Blackcurrant, Bergamot, Apple',
      heart: 'Birch, Patchouli, Moroccan Jasmine, Rose',
      base: 'Musk, Oakmoss, Ambergris, Vanille'
    },
    description: 'A sensual, audacious, and contemporary scent combining alluring fruity top notes with rich woody base.',
    imageUrl: '/src/assets/images/perfume_noir_marble_1793767551333.jpg',
    isBestSeller: true,
    active: true,
    createdAt: '2026-01-16T10:00:00Z',
    variants: [
      { id: 'var-avnt-10', size: '10ml', costPrice: 55, sellingPrice: 160, stock: 20, reorderLevel: 5, barcode: 'PERF-AVNT-10ML', sku: 'AV-10' },
      { id: 'var-avnt-30', size: '30ml', costPrice: 130, sellingPrice: 290, stock: 16, reorderLevel: 5, barcode: 'PERF-AVNT-30ML', sku: 'AV-30' },
      { id: 'var-avnt-50', size: '50ml', costPrice: 190, sellingPrice: 450, stock: 11, reorderLevel: 5, barcode: 'PERF-AVNT-50ML', sku: 'AV-50' },
      { id: 'var-avnt-100', size: '100ml', costPrice: 310, sellingPrice: 780, stock: 6, reorderLevel: 3, barcode: 'PERF-AVNT-100ML', sku: 'AV-100' },
    ]
  },
  {
    id: 'prod-black-opium',
    name: 'Black Opium Inspired',
    brand: 'YSL Inspired',
    category: 'Women',
    concentration: 'Eau de Parfum (20% Oil)',
    fragranceNotes: {
      top: 'Pear, Pink Pepper, Orange Blossom',
      heart: 'Coffee, Jasmine, Bitter Almond, Licorice',
      base: 'Vanilla, Patchouli, Cashmere Wood, Cedar'
    },
    description: 'Addictive gourmand floral with notes of black coffee, sensual white flowers, and sweet vanilla.',
    imageUrl: '/src/assets/images/perfume_amber_luxury_1793767551103.jpg',
    isBestSeller: true,
    active: true,
    createdAt: '2026-01-18T11:00:00Z',
    variants: [
      { id: 'var-blkop-10', size: '10ml', costPrice: 45, sellingPrice: 140, stock: 19, reorderLevel: 5, barcode: 'PERF-BKOP-10ML', sku: 'BO-10' },
      { id: 'var-blkop-30', size: '30ml', costPrice: 110, sellingPrice: 260, stock: 2, reorderLevel: 5, barcode: 'PERF-BKOP-30ML', sku: 'BO-30' }, // Low stock 3
      { id: 'var-blkop-50', size: '50ml', costPrice: 170, sellingPrice: 390, stock: 14, reorderLevel: 5, barcode: 'PERF-BKOP-50ML', sku: 'BO-50' },
      { id: 'var-blkop-100', size: '100ml', costPrice: 280, sellingPrice: 690, stock: 5, reorderLevel: 3, barcode: 'PERF-BKOP-100ML', sku: 'BO-100' },
    ]
  },
  {
    id: 'prod-santal-33',
    name: 'Santal 33 Inspired',
    brand: 'Le Labo Inspired',
    category: 'Unisex',
    concentration: 'Extrait de Parfum (30% Oil)',
    fragranceNotes: {
      top: 'Violet Accord, Cardamom, Papyrus',
      heart: 'Iris, Ambrox, Cedarwood',
      base: 'Australian Sandalwood, Leather, Smoky Musk'
    },
    description: 'An intoxicating cult-favorite smoky woody blend reminiscent of the American West and artisan leather.',
    imageUrl: '/src/assets/images/perfume_crystal_fresh_1793767552606.jpg',
    isBestSeller: false,
    active: true,
    createdAt: '2026-01-20T14:20:00Z',
    variants: [
      { id: 'var-sant-10', size: '10ml', costPrice: 60, sellingPrice: 170, stock: 12, reorderLevel: 5, barcode: 'PERF-SANT-10ML', sku: 'ST-10' },
      { id: 'var-sant-30', size: '30ml', costPrice: 135, sellingPrice: 310, stock: 18, reorderLevel: 5, barcode: 'PERF-SANT-30ML', sku: 'ST-30' },
      { id: 'var-sant-50', size: '50ml', costPrice: 200, sellingPrice: 470, stock: 8, reorderLevel: 5, barcode: 'PERF-SANT-50ML', sku: 'ST-50' },
      { id: 'var-sant-100', size: '100ml', costPrice: 320, sellingPrice: 820, stock: 4, reorderLevel: 3, barcode: 'PERF-SANT-100ML', sku: 'ST-100' },
    ]
  },
  {
    id: 'prod-delina',
    name: 'Delina Exclusif Inspired',
    brand: 'Parfums de Marly Inspired',
    category: 'Women',
    concentration: 'Extrait de Parfum (30% Oil)',
    fragranceNotes: {
      top: 'Lychee, Pear, Bergamot',
      heart: 'Turkish Rose, Incense, Oud',
      base: 'Vanilla, Amber, Woody Notes'
    },
    description: 'A luxurious sensual bouquet dominated by damascena rose and exotic lychee with a velvety smoky undertone.',
    imageUrl: '/src/assets/images/perfume_variants_lineup_1793767552523.jpg',
    isBestSeller: false,
    active: true,
    createdAt: '2026-02-01T08:15:00Z',
    variants: [
      { id: 'var-dln-10', size: '10ml', costPrice: 65, sellingPrice: 180, stock: 14, reorderLevel: 5, barcode: 'PERF-DLN-10ML', sku: 'DL-10' },
      { id: 'var-dln-30', size: '30ml', costPrice: 140, sellingPrice: 320, stock: 1, reorderLevel: 5, barcode: 'PERF-DLN-30ML', sku: 'DL-30' }, // Low stock 4
      { id: 'var-dln-50', size: '50ml', costPrice: 210, sellingPrice: 490, stock: 7, reorderLevel: 5, barcode: 'PERF-DLN-50ML', sku: 'DL-50' },
      { id: 'var-dln-100', size: '100ml', costPrice: 340, sellingPrice: 850, stock: 5, reorderLevel: 3, barcode: 'PERF-DLN-100ML', sku: 'DL-100' },
    ]
  },
  {
    id: 'prod-lost-cherry',
    name: 'Lost Cherry Inspired',
    brand: 'Tom Ford Inspired',
    category: 'Gourmand',
    concentration: 'Extrait de Parfum (30% Oil)',
    fragranceNotes: {
      top: 'Black Cherry, Cherry Liqueur, Bitter Almond',
      heart: 'Griotte Syrup, Turkish Rose, Jasmine Sambac',
      base: 'Peru Balsam, Roasted Tonka, Sandalwood, Vetiver'
    },
    description: 'A full-bodied journey into the once-forbidden; a contrasting scent that reveals a tempting candy luster.',
    imageUrl: '/src/assets/images/perfume_amber_luxury_1793767551103.jpg',
    isBestSeller: true,
    active: true,
    createdAt: '2026-02-05T15:00:00Z',
    variants: [
      { id: 'var-lch-10', size: '10ml', costPrice: 65, sellingPrice: 180, stock: 16, reorderLevel: 5, barcode: 'PERF-LCH-10ML', sku: 'LC-10' },
      { id: 'var-lch-30', size: '30ml', costPrice: 145, sellingPrice: 330, stock: 11, reorderLevel: 5, barcode: 'PERF-LCH-30ML', sku: 'LC-30' },
      { id: 'var-lch-50', size: '50ml', costPrice: 215, sellingPrice: 510, stock: 5, reorderLevel: 5, barcode: 'PERF-LCH-50ML', sku: 'LC-50' }, // Low stock 5 (boundary <=5)
      { id: 'var-lch-100', size: '100ml', costPrice: 350, sellingPrice: 880, stock: 6, reorderLevel: 3, barcode: 'PERF-LCH-100ML', sku: 'LC-100' },
    ]
  },
  {
    id: 'prod-light-blue',
    name: 'Light Blue Intense Inspired',
    brand: 'Dolce & Gabbana Inspired',
    category: 'Fresh & Citrus',
    concentration: 'Eau de Parfum (20% Oil)',
    fragranceNotes: {
      top: 'Lemon, Granny Smith Apple',
      heart: 'Marigold, Jasmine Petals',
      base: 'Amber Woods, Musk'
    },
    description: 'Sun-drenched Mediterranean breeze bursting with zesty citrus and crisp green apple.',
    imageUrl: '/src/assets/images/perfume_crystal_fresh_1793767552606.jpg',
    isBestSeller: false,
    active: true,
    createdAt: '2026-02-10T12:00:00Z',
    variants: [
      { id: 'var-lb-10', size: '10ml', costPrice: 45, sellingPrice: 130, stock: 22, reorderLevel: 5, barcode: 'PERF-LB-10ML', sku: 'LB-10' },
      { id: 'var-lb-30', size: '30ml', costPrice: 105, sellingPrice: 250, stock: 28, reorderLevel: 5, barcode: 'PERF-LB-30ML', sku: 'LB-30' },
      { id: 'var-lb-50', size: '50ml', costPrice: 165, sellingPrice: 380, stock: 15, reorderLevel: 5, barcode: 'PERF-LB-50ML', sku: 'LB-50' },
      { id: 'var-lb-100', size: '100ml', costPrice: 270, sellingPrice: 650, stock: 9, reorderLevel: 3, barcode: 'PERF-LB-100ML', sku: 'LB-100' },
    ]
  },
  {
    id: 'prod-eros',
    name: 'Eros Flame Inspired',
    brand: 'Versace Inspired',
    category: 'Woody & Oriental',
    concentration: 'Eau de Parfum (20% Oil)',
    fragranceNotes: {
      top: 'Mandarin Orange, Black Pepper, Rosemary, Lemon',
      heart: 'Pepperwood, Geranium, Rose',
      base: 'Vanilla, Tonka Bean, Sandalwood, Texas Cedar, Patchouli'
    },
    description: 'Fiery passion with cold and hot, sweet and spicy notes struck in harmonious tension.',
    imageUrl: '/src/assets/images/perfume_noir_marble_1793767551333.jpg',
    isBestSeller: false,
    active: true,
    createdAt: '2026-02-12T16:00:00Z',
    variants: [
      { id: 'var-eros-10', size: '10ml', costPrice: 48, sellingPrice: 140, stock: 15, reorderLevel: 5, barcode: 'PERF-EROS-10ML', sku: 'ER-10' },
      { id: 'var-eros-30', size: '30ml', costPrice: 115, sellingPrice: 270, stock: 20, reorderLevel: 5, barcode: 'PERF-EROS-30ML', sku: 'ER-30' },
      { id: 'var-eros-50', size: '50ml', costPrice: 175, sellingPrice: 410, stock: 12, reorderLevel: 5, barcode: 'PERF-EROS-50ML', sku: 'ER-50' },
      { id: 'var-eros-100', size: '100ml', costPrice: 285, sellingPrice: 720, stock: 7, reorderLevel: 3, barcode: 'PERF-EROS-100ML', sku: 'ER-100' },
    ]
  },
  {
    id: 'prod-bleu',
    name: 'Bleu de Chanel Inspired',
    brand: 'Chanel Inspired',
    category: 'Men',
    concentration: 'Extrait de Parfum (30% Oil)',
    fragranceNotes: {
      top: 'Grapefruit, Lemon, Mint, Pink Pepper',
      heart: 'Ginger, Nutmeg, Jasmine, Iso E Super',
      base: 'Incense, Vetiver, Cedar, Sandalwood, Patchouli'
    },
    description: 'An ode to male freedom in a woody aromatic fragrance with a captivating trail.',
    imageUrl: '/src/assets/images/perfume_noir_marble_1793767551333.jpg',
    isBestSeller: true,
    active: true,
    createdAt: '2026-02-15T10:00:00Z',
    variants: [
      { id: 'var-bleu-10', size: '10ml', costPrice: 52, sellingPrice: 150, stock: 24, reorderLevel: 5, barcode: 'PERF-BLEU-10ML', sku: 'BC-10' },
      { id: 'var-bleu-30', size: '30ml', costPrice: 125, sellingPrice: 280, stock: 19, reorderLevel: 5, barcode: 'PERF-BLEU-30ML', sku: 'BC-30' },
      { id: 'var-bleu-50', size: '50ml', costPrice: 185, sellingPrice: 430, stock: 14, reorderLevel: 5, barcode: 'PERF-BLEU-50ML', sku: 'BC-50' },
      { id: 'var-bleu-100', size: '100ml', costPrice: 300, sellingPrice: 760, stock: 8, reorderLevel: 3, barcode: 'PERF-BLEU-100ML', sku: 'BC-100' },
    ]
  },
  {
    id: 'prod-angelfhare',
    name: 'Angels Share Inspired',
    brand: 'Kilian Inspired',
    category: 'Gourmand',
    concentration: 'Extrait de Parfum (30% Oil)',
    fragranceNotes: {
      top: 'Cognac Essence',
      heart: 'Cinnamon Bark, Tonka Bean, Oak Absolute',
      base: 'Praline, Vanilla, Creamy Sandalwood'
    },
    description: 'Deep warm amber cognac warmed by cinnamon and oak barrels. Pure olfactory decadence.',
    imageUrl: '/src/assets/images/perfume_amber_luxury_1793767551103.jpg',
    isBestSeller: false,
    active: true,
    createdAt: '2026-02-20T11:00:00Z',
    variants: [
      { id: 'var-ashr-10', size: '10ml', costPrice: 70, sellingPrice: 190, stock: 15, reorderLevel: 5, barcode: 'PERF-ASHR-10ML', sku: 'AS-10' },
      { id: 'var-ashr-30', size: '30ml', costPrice: 150, sellingPrice: 340, stock: 13, reorderLevel: 5, barcode: 'PERF-ASHR-30ML', sku: 'AS-30' },
      { id: 'var-ashr-50', size: '50ml', costPrice: 220, sellingPrice: 530, stock: 8, reorderLevel: 5, barcode: 'PERF-ASHR-50ML', sku: 'AS-50' },
      { id: 'var-ashr-100', size: '100ml', costPrice: 360, sellingPrice: 890, stock: 5, reorderLevel: 3, barcode: 'PERF-ASHR-100ML', sku: 'AS-100' },
    ]
  },
  {
    id: 'prod-wood-sage',
    name: 'Wood Sage & Sea Salt Inspired',
    brand: 'Jo Malone Inspired',
    category: 'Fresh & Citrus',
    concentration: 'Eau de Parfum (20% Oil)',
    fragranceNotes: {
      top: 'Ambrette Seeds',
      heart: 'Sea Salt, Mineral Accord',
      base: 'Sage, Red Algae, Driftwood'
    },
    description: 'Escape the everyday along the windswept shore. Fresh mineral sea salt mingling with earthy woody sage.',
    imageUrl: '/src/assets/images/perfume_crystal_fresh_1793767552606.jpg',
    isBestSeller: false,
    active: true,
    createdAt: '2026-02-22T13:30:00Z',
    variants: [
      { id: 'var-wss-10', size: '10ml', costPrice: 45, sellingPrice: 130, stock: 17, reorderLevel: 5, barcode: 'PERF-WSS-10ML', sku: 'WS-10' },
      { id: 'var-wss-30', size: '30ml', costPrice: 110, sellingPrice: 260, stock: 21, reorderLevel: 5, barcode: 'PERF-WSS-30ML', sku: 'WS-30' },
      { id: 'var-wss-50', size: '50ml', costPrice: 170, sellingPrice: 400, stock: 10, reorderLevel: 5, barcode: 'PERF-WSS-50ML', sku: 'WS-50' },
      { id: 'var-wss-100', size: '100ml', costPrice: 280, sellingPrice: 680, stock: 6, reorderLevel: 3, barcode: 'PERF-WSS-100ML', sku: 'WS-100' },
    ]
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Maria Santos',
    phone: '0917-884-2190',
    email: 'maria.santos@gmail.com',
    loyaltyPoints: 180,
    totalSpend: 12450,
    totalOrders: 14,
    tier: 'VIP',
    joinedDate: '2026-01-10'
  },
  {
    id: 'cust-2',
    name: 'Juan Dela Cruz',
    phone: '0918-552-3914',
    email: 'juan.delacruz@yahoo.com',
    loyaltyPoints: 95,
    totalSpend: 6200,
    totalOrders: 7,
    tier: 'Gold',
    joinedDate: '2026-01-22'
  },
  {
    id: 'cust-3',
    name: 'Bea Alonzo-Tan',
    phone: '0922-310-8874',
    email: 'bea.tan@outlook.com',
    loyaltyPoints: 45,
    totalSpend: 2850,
    totalOrders: 3,
    tier: 'Silver',
    joinedDate: '2026-02-04'
  },
  {
    id: 'cust-4',
    name: 'David Guinto',
    phone: '0905-641-7729',
    loyaltyPoints: 20,
    totalSpend: 1100,
    totalOrders: 2,
    tier: 'Bronze',
    joinedDate: '2026-02-18'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'supp-1',
    name: 'Grasse Fine Fragrance Oils Inc.',
    contactPerson: 'Jean-Luc Dubois / Elena Valderama',
    phone: '0917-550-1288',
    email: 'sales@grasse-oils.ph',
    address: 'Warehouse 4, Ortigas Technocenter, Pasig City',
    categoriesSupplied: ['Fragrance Oils', 'Fixatives', 'Concentrates'],
    leadTimeDays: 3
  },
  {
    id: 'supp-2',
    name: 'LuxGlass Packaging & Flacons Manila',
    contactPerson: 'Henry Lim',
    phone: '0920-912-4433',
    email: 'orders@luxglassflacons.com',
    address: '108 Industrial Road, Valenzuela City',
    categoriesSupplied: ['Bottles & Sprayers', 'Caps', 'Crimping Tools'],
    leadTimeDays: 2
  },
  {
    id: 'supp-3',
    name: 'Manila Aroma Solvents & Bases',
    contactPerson: 'Atty. Roberto Sotto',
    phone: '0927-440-9912',
    email: 'supply@aromasolvents.ph',
    address: 'Unit 12, Light Industry Zone, Laguna',
    categoriesSupplied: ['Alcohol & Solvents', 'Dipropylene Glycol', 'Packaging & Boxes'],
    leadTimeDays: 4
  }
];

export const initialSales: SaleTransaction[] = [
  {
    id: 'tx-1001',
    invoiceNumber: 'INV-20261103-0001',
    timestamp: '2026-11-03T10:14:00Z',
    cashierName: 'Camille Cruz',
    customer: { id: 'cust-1', name: 'Maria Santos', phone: '0917-884-2190', pointsEarned: 18, pointsRedeemed: 0 },
    items: [
      {
        productId: 'prod-sauvage',
        variantId: 'var-sauv-30',
        productName: 'Sauvage Inspired',
        brand: 'Dior Inspired',
        size: '30ml',
        barcode: 'PERF-SAUV-30ML',
        unitCost: 120,
        unitPrice: 280,
        quantity: 2,
        discount: 0,
        lineTotal: 560
      },
      {
        productId: 'prod-baccarat',
        variantId: 'var-br540-50',
        productName: 'Baccarat Rouge 540 Inspired',
        brand: 'MFK Inspired',
        size: '50ml',
        barcode: 'PERF-BR540-50ML',
        unitCost: 210,
        unitPrice: 490,
        quantity: 1,
        discount: 0,
        lineTotal: 490
      }
    ],
    subtotal: 1050,
    discountAmount: 0,
    discountType: 'none',
    taxAmount: 0,
    total: 1050,
    totalCost: 450,
    grossProfit: 600,
    paymentMethod: 'gcash',
    paymentDetails: { gcashRef: 'GC-992384112' },
    status: 'completed'
  },
  {
    id: 'tx-1002',
    invoiceNumber: 'INV-20261103-0002',
    timestamp: '2026-11-03T11:45:00Z',
    cashierName: 'Camille Cruz',
    customer: { id: 'cust-2', name: 'Juan Dela Cruz', phone: '0918-552-3914', pointsEarned: 35, pointsRedeemed: 0 },
    items: [
      {
        productId: 'prod-aventus',
        variantId: 'var-avnt-100',
        productName: 'Aventus Inspired',
        brand: 'Creed Inspired',
        size: '100ml',
        barcode: 'PERF-AVNT-100ML',
        unitCost: 310,
        unitPrice: 780,
        quantity: 1,
        discount: 0,
        lineTotal: 780
      },
      {
        productId: 'prod-lost-cherry',
        variantId: 'var-lch-50',
        productName: 'Lost Cherry Inspired',
        brand: 'Tom Ford Inspired',
        size: '50ml',
        barcode: 'PERF-LCH-50ML',
        unitCost: 215,
        unitPrice: 510,
        quantity: 2,
        discount: 0,
        lineTotal: 1020
      }
    ],
    subtotal: 1800,
    discountAmount: 100,
    discountType: 'custom',
    taxAmount: 0,
    total: 1700,
    totalCost: 740,
    grossProfit: 960,
    paymentMethod: 'cash',
    paymentDetails: { cashReceived: 2000, changeGiven: 300 },
    status: 'completed'
  },
  {
    id: 'tx-1003',
    invoiceNumber: 'INV-20261103-0003',
    timestamp: '2026-11-03T14:10:00Z',
    cashierName: 'Camille Cruz',
    items: [
      {
        productId: 'prod-bleu',
        variantId: 'var-bleu-50',
        productName: 'Bleu de Chanel Inspired',
        brand: 'Chanel Inspired',
        size: '50ml',
        barcode: 'PERF-BLEU-50ML',
        unitCost: 185,
        unitPrice: 430,
        quantity: 2,
        discount: 0,
        lineTotal: 860
      },
      {
        productId: 'prod-angelfhare',
        variantId: 'var-ashr-30',
        productName: 'Angels Share Inspired',
        brand: 'Kilian Inspired',
        size: '30ml',
        barcode: 'PERF-ASHR-30ML',
        unitCost: 150,
        unitPrice: 340,
        quantity: 1,
        discount: 0,
        lineTotal: 340
      }
    ],
    subtotal: 1200,
    discountAmount: 0,
    discountType: 'none',
    taxAmount: 0,
    total: 1200,
    totalCost: 520,
    grossProfit: 680,
    paymentMethod: 'gcash',
    paymentDetails: { gcashRef: 'GC-448821990' },
    status: 'completed'
  },
  {
    id: 'tx-1004',
    invoiceNumber: 'INV-20261103-0004',
    timestamp: '2026-11-03T16:25:00Z',
    cashierName: 'Camille Cruz',
    items: [
      {
        productId: 'prod-baccarat',
        variantId: 'var-br540-100',
        productName: 'Baccarat Rouge 540 Inspired',
        brand: 'MFK Inspired',
        size: '100ml',
        barcode: 'PERF-BR540-100ML',
        unitCost: 340,
        unitPrice: 850,
        quantity: 2,
        discount: 0,
        lineTotal: 1700
      },
      {
        productId: 'prod-santal-33',
        variantId: 'var-sant-50',
        productName: 'Santal 33 Inspired',
        brand: 'Le Labo Inspired',
        size: '50ml',
        barcode: 'PERF-SANT-50ML',
        unitCost: 200,
        unitPrice: 470,
        quantity: 2,
        discount: 0,
        lineTotal: 940
      },
      {
        productId: 'prod-sauvage',
        variantId: 'var-sauv-30',
        productName: 'Sauvage Inspired',
        brand: 'Dior Inspired',
        size: '30ml',
        barcode: 'PERF-SAUV-30ML',
        unitCost: 120,
        unitPrice: 280,
        quantity: 1,
        discount: 0,
        lineTotal: 280
      }
    ],
    subtotal: 2920,
    discountAmount: 120,
    discountType: 'promo_10',
    taxAmount: 0,
    total: 2800,
    totalCost: 1200,
    grossProfit: 1600,
    paymentMethod: 'card',
    paymentDetails: { cardRef: 'MASTERCARD-7714' },
    status: 'completed'
  },
  {
    id: 'tx-1005',
    invoiceNumber: 'INV-20261103-0005',
    timestamp: '2026-11-03T18:05:00Z',
    cashierName: 'Camille Cruz',
    customer: { id: 'cust-3', name: 'Bea Alonzo-Tan', phone: '0922-310-8874', pointsEarned: 34, pointsRedeemed: 0 },
    items: [
      {
        productId: 'prod-delina',
        variantId: 'var-dln-50',
        productName: 'Delina Exclusif Inspired',
        brand: 'Parfums de Marly Inspired',
        size: '50ml',
        barcode: 'PERF-DLN-50ML',
        unitCost: 210,
        unitPrice: 490,
        quantity: 1,
        discount: 0,
        lineTotal: 490
      },
      {
        productId: 'prod-black-opium',
        variantId: 'var-blkop-50',
        productName: 'Black Opium Inspired',
        brand: 'YSL Inspired',
        size: '50ml',
        barcode: 'PERF-BKOP-50ML',
        unitCost: 170,
        unitPrice: 390,
        quantity: 1,
        discount: 0,
        lineTotal: 390
      },
      {
        productId: 'prod-wood-sage',
        variantId: 'var-wss-30',
        productName: 'Wood Sage & Sea Salt Inspired',
        brand: 'Jo Malone Inspired',
        size: '30ml',
        barcode: 'PERF-WSS-30ML',
        unitCost: 110,
        unitPrice: 260,
        quantity: 2,
        discount: 0,
        lineTotal: 520
      },
      {
        productId: 'prod-light-blue',
        variantId: 'var-lb-30',
        productName: 'Light Blue Intense Inspired',
        brand: 'Dolce & Gabbana Inspired',
        size: '30ml',
        barcode: 'PERF-LB-30ML',
        unitCost: 105,
        unitPrice: 250,
        quantity: 1,
        discount: 0,
        lineTotal: 250
      },
      {
        productId: 'prod-eros',
        variantId: 'var-eros-10',
        productName: 'Eros Flame Inspired',
        brand: 'Versace Inspired',
        size: '10ml',
        barcode: 'PERF-EROS-10ML',
        unitCost: 48,
        unitPrice: 140,
        quantity: 1,
        discount: 0,
        lineTotal: 140
      }
    ],
    subtotal: 1790,
    discountAmount: 90,
    discountType: 'custom',
    taxAmount: 0,
    total: 1700,
    totalCost: 748,
    grossProfit: 952,
    paymentMethod: 'cash',
    paymentDetails: { cashReceived: 2000, changeGiven: 300 },
    status: 'completed'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-11-03',
    category: 'Packaging & Boxes',
    description: 'Custom Gold Foil Perfume Gift Bags & Velvet Pouches (Batch of 200)',
    amount: 1450,
    paymentMethod: 'gcash',
    referenceNumber: 'EXP-GC-99120',
    recordedBy: 'Marcus Tan'
  },
  {
    id: 'exp-2',
    date: '2026-11-02',
    category: 'Alcohol & Solvents',
    description: 'Cosmetic Grade Sugarcane Alcohol 96% (20L Jerry Can)',
    amount: 2200,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'BDO-TRF-44102',
    recordedBy: 'Marcus Tan'
  },
  {
    id: 'exp-3',
    date: '2026-11-01',
    category: 'Store Maintenance',
    description: 'Boutique fragrance tester blotter strips (1,000 pcs) + Acrylic display risers',
    amount: 680,
    paymentMethod: 'cash',
    referenceNumber: 'OR-88219',
    recordedBy: 'Althea Ramos (Owner)'
  }
];

export const initialShift: RegisterShift = {
  id: 'shift-today',
  cashier: 'Camille Cruz',
  openedAt: '2026-11-03T09:00:00Z',
  openingFloat: 3000,
  cashSales: 3400,
  gcashSales: 2250,
  cardSales: 2800,
  expectedCash: 6400, // 3000 float + 3400 cash sales
  status: 'open',
  notes: 'Opening float verified by Camille Cruz and Marcus Tan.'
};

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-03T09:00:00Z',
    user: 'Camille Cruz',
    action: 'Register Shift Opened',
    details: 'Opened morning drawer with float ₱3,000.00',
    severity: 'info'
  },
  {
    id: 'log-2',
    timestamp: '2026-11-03T10:14:00Z',
    user: 'Camille Cruz',
    action: 'Sale Completed',
    details: 'Invoice #INV-20261103-0001 (₱1,050.00 via GCash)',
    severity: 'info'
  },
  {
    id: 'log-3',
    timestamp: '2026-11-03T11:45:00Z',
    user: 'Camille Cruz',
    action: 'Sale Completed',
    details: 'Invoice #INV-20261103-0002 (₱1,700.00 via Cash)',
    severity: 'info'
  },
  {
    id: 'log-4',
    timestamp: '2026-11-03T13:30:00Z',
    user: 'Marcus Tan',
    action: 'Stock Adjustment',
    details: 'Lost Cherry 50ml adjusted -1 bottle (Sample Tester displayed on counter)',
    severity: 'warning'
  },
  {
    id: 'log-5',
    timestamp: '2026-11-03T16:25:00Z',
    user: 'Camille Cruz',
    action: 'Sale Completed',
    details: 'Invoice #INV-20261103-0004 (₱2,800.00 via Card)',
    severity: 'info'
  }
];
