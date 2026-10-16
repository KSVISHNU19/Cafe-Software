const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Cafe Database with Rupee Currency ---');

  // 1. Create or ensure Cafe
  const cafe = await prisma.cafe.upsert({
    where: { id: 'cafe-brewdesk-01' },
    update: {
      name: 'Cafe Artisan Roastery',
      currency: '₹',
      currencyCode: 'INR',
      receiptHeader: 'Cafe Coffee Co. • Freshly Roasted Daily',
      receiptFooter: 'Guest Wi-Fi: CafeGuest • Pass: velvetcrema\nThank you for supporting artisan coffee!',
    },
    create: {
      id: 'cafe-brewdesk-01',
      name: 'Cafe Artisan Roastery',
      tagline: 'Artisanal Single-Origin Coffee & Kitchen',
      address: '142 Espresso Boulevard, Downtown Arts District',
      phone: '+91 98765 43210',
      currency: '₹',
      currencyCode: 'INR',
      timezone: 'Asia/Kolkata',
      taxRatePercent: 5.0, // Standard GST for cafe
      receiptHeader: 'Cafe Coffee Co. • Freshly Roasted Daily',
      receiptFooter: 'Guest Wi-Fi: CafeGuest • Pass: velvetcrema\nThank you for supporting artisan coffee!',
    },
  });

  console.log('Cafe created:', cafe.name);

  // 2. Create Users
  const usersData = [
    {
      id: 'user-owner-01',
      cafeId: cafe.id,
      name: 'Elena Vance',
      email: 'owner@cafe.internal',
      passwordHash: 'hashed_owner_123',
      role: 'OWNER',
      pinCode: '1111',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-manager-01',
      cafeId: cafe.id,
      name: 'Marcus Cole',
      email: 'manager@cafe.internal',
      passwordHash: 'hashed_manager_123',
      role: 'MANAGER',
      pinCode: '2222',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-barista-01',
      cafeId: cafe.id,
      name: 'Samira Patel',
      email: 'barista@cafe.internal',
      passwordHash: 'hashed_barista_123',
      role: 'BARISTA',
      pinCode: '3333',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-cashier-01',
      cafeId: cafe.id,
      name: 'Leo Morales',
      email: 'cashier@cafe.internal',
      passwordHash: 'hashed_cashier_123',
      role: 'CASHIER',
      pinCode: '4444',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-inventory-01',
      cafeId: cafe.id,
      name: 'Chloe Bennett',
      email: 'inventory@cafe.internal',
      passwordHash: 'hashed_inv_123',
      role: 'INVENTORY',
      pinCode: '5555',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: u,
    });
  }

  // 3. Create Suppliers
  const suppliersData = [
    {
      id: 'sup-01',
      cafeId: cafe.id,
      name: 'Heritage Single-Origin Roasters',
      contactPerson: 'David Sterling',
      email: 'orders@heritageroast.com',
      phone: '+91 98200 12345',
      address: '74 Industrial Estate, Roastery District',
    },
    {
      id: 'sup-02',
      cafeId: cafe.id,
      name: 'Clover Valley Organic Dairy & Alternatives',
      contactPerson: 'Sarah Jenkins',
      email: 'wholesale@clovervalleydairy.com',
      phone: '+91 98200 54321',
      address: '12 Organic Farmhouse Lane',
    },
    {
      id: 'sup-03',
      cafeId: cafe.id,
      name: 'Golden Crust Artisan Bakery Co.',
      contactPerson: 'Jean-Luc Moreau',
      email: 'bakehouse@goldencrust.com',
      phone: '+91 98200 67890',
      address: '300 Patisserie Road',
    },
    {
      id: 'sup-04',
      cafeId: cafe.id,
      name: 'EcoCraft Biodegradable Packaging',
      contactPerson: 'Alex Rivera',
      email: 'orders@ecocraftpack.com',
      phone: '+91 98200 99887',
      address: '88 Green Park Blvd',
    },
  ];

  for (const sup of suppliersData) {
    await prisma.supplier.upsert({
      where: { id: sup.id },
      update: sup,
      create: sup,
    });
  }

  // 4. Create Inventory Items (with Rupee costs)
  const inventoryData = [
    { id: 'inv-beans', cafeId: cafe.id, name: 'Ethiopia Yirgacheffe Beans (Whole)', sku: 'RAW-BEAN-ETH', unit: 'kg', currentStock: 18.5, reorderLevel: 8.0, costPerUnit: 1400.0, supplierId: 'sup-01' },
    { id: 'inv-colombia', cafeId: cafe.id, name: 'Colombia Huila Espresso Roast', sku: 'RAW-BEAN-COL', unit: 'kg', currentStock: 4.2, reorderLevel: 10.0, costPerUnit: 1250.0, supplierId: 'sup-01' }, // Low stock
    { id: 'inv-milk-whole', cafeId: cafe.id, name: 'Fresh Whole Milk (Barista Grade)', sku: 'RAW-MLK-WHOLE', unit: 'l', currentStock: 28.0, reorderLevel: 15.0, costPerUnit: 75.0, supplierId: 'sup-02' },
    { id: 'inv-milk-oat', cafeId: cafe.id, name: 'Oatly Barista Edition Oat Milk', sku: 'RAW-MLK-OAT', unit: 'l', currentStock: 6.0, reorderLevel: 12.0, costPerUnit: 240.0, supplierId: 'sup-02' }, // Low stock
    { id: 'inv-syrup-vanilla', cafeId: cafe.id, name: 'Madagascar Vanilla Syrup (750ml)', sku: 'RAW-SYR-VAN', unit: 'bottle', currentStock: 8.0, reorderLevel: 3.0, costPerUnit: 650.0, supplierId: 'sup-02' },
    { id: 'inv-syrup-caramel', cafeId: cafe.id, name: 'Smoked Sea Salt Caramel (750ml)', sku: 'RAW-SYR-CAR', unit: 'bottle', currentStock: 2.0, reorderLevel: 4.0, costPerUnit: 680.0, supplierId: 'sup-02' }, // Low stock
    { id: 'inv-matcha', cafeId: cafe.id, name: 'Uji Ceremonial Grade Matcha Powder', sku: 'RAW-TEA-MAT', unit: 'kg', currentStock: 3.5, reorderLevel: 1.5, costPerUnit: 3800.0, supplierId: 'sup-01' },
    { id: 'inv-cups-12oz', cafeId: cafe.id, name: '12oz Compostable Hot Cups', sku: 'PCK-CUP-12', unit: 'sleeves', currentStock: 35.0, reorderLevel: 10.0, costPerUnit: 180.0, supplierId: 'sup-04' },
    { id: 'inv-cups-16oz', cafeId: cafe.id, name: '16oz Clear Recycled Iced Tumblers', sku: 'PCK-CUP-16', unit: 'sleeves', currentStock: 40.0, reorderLevel: 12.0, costPerUnit: 210.0, supplierId: 'sup-04' },
    { id: 'inv-croissant-raw', cafeId: cafe.id, name: 'Artisan Butter Croissants (Frozen ready)', sku: 'BAK-CRS-RAW', unit: 'pcs', currentStock: 45.0, reorderLevel: 20.0, costPerUnit: 70.0, supplierId: 'sup-03' },
  ];

  for (const inv of inventoryData) {
    await prisma.inventoryItem.upsert({
      where: { id: inv.id },
      update: inv,
      create: inv,
    });
  }

  // 5. Create Categories
  const categoriesData = [
    { id: 'cat-hot-coffee', cafeId: cafe.id, name: 'Hot Coffee', icon: 'Coffee', displayOrder: 1 },
    { id: 'cat-cold-brews', cafeId: cafe.id, name: 'Cold Brews & Iced', icon: 'CupSoda', displayOrder: 2 },
    { id: 'cat-tea', cafeId: cafe.id, name: 'Specialty Tea & Matcha', icon: 'Sparkles', displayOrder: 3 },
    { id: 'cat-bakery', cafeId: cafe.id, name: 'Artisan Bakery', icon: 'Croissant', displayOrder: 4 },
    { id: 'cat-gourmet', cafeId: cafe.id, name: 'Kitchen & Sandwiches', icon: 'Sandwich', displayOrder: 5 },
    { id: 'cat-desserts', cafeId: cafe.id, name: 'Desserts & Sweets', icon: 'CakeSlice', displayOrder: 6 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  // 6. Create Modifier Groups & Options (Rupee add-ons)
  const modMilk = await prisma.modifierGroup.upsert({
    where: { id: 'mod-milk' },
    update: {},
    create: {
      id: 'mod-milk',
      cafeId: cafe.id,
      name: 'Milk Preference',
      required: false,
      minSelections: 0,
      maxSelections: 1,
      options: {
        create: [
          { name: 'Whole Milk (Standard)', price: 0.0, isDefault: true },
          { name: 'Oat Milk (Barista Blend)', price: 50.0, isDefault: false },
          { name: 'Almond Silk Milk', price: 45.0, isDefault: false },
          { name: 'Coconut Dream Milk', price: 45.0, isDefault: false },
          { name: 'Skim / Non-Fat', price: 0.0, isDefault: false },
        ],
      },
    },
  });

  const modSyrup = await prisma.modifierGroup.upsert({
    where: { id: 'mod-syrup' },
    update: {},
    create: {
      id: 'mod-syrup',
      cafeId: cafe.id,
      name: 'Syrup / Flavor Pumps',
      required: false,
      minSelections: 0,
      maxSelections: 3,
      options: {
        create: [
          { name: 'Vanilla Bean (+1 pump)', price: 35.0, isDefault: false },
          { name: 'Sea Salt Caramel (+1 pump)', price: 35.0, isDefault: false },
          { name: 'Roasted Hazelnut (+1 pump)', price: 35.0, isDefault: false },
          { name: 'Sugar-Free French Vanilla', price: 35.0, isDefault: false },
        ],
      },
    },
  });

  const modEspresso = await prisma.modifierGroup.upsert({
    where: { id: 'mod-espresso' },
    update: {},
    create: {
      id: 'mod-espresso',
      cafeId: cafe.id,
      name: 'Espresso Boost',
      required: false,
      minSelections: 0,
      maxSelections: 2,
      options: {
        create: [
          { name: 'Standard Double Shot', price: 0.0, isDefault: true },
          { name: 'Extra Espresso Shot (+1)', price: 60.0, isDefault: false },
          { name: 'Decaf Swiss Water Process', price: 30.0, isDefault: false },
        ],
      },
    },
  });

  const modTemp = await prisma.modifierGroup.upsert({
    where: { id: 'mod-temp' },
    update: {},
    create: {
      id: 'mod-temp',
      cafeId: cafe.id,
      name: 'Ice & Temperature',
      required: false,
      minSelections: 0,
      maxSelections: 1,
      options: {
        create: [
          { name: 'Standard Ice', price: 0.0, isDefault: true },
          { name: 'Light Ice', price: 0.0, isDefault: false },
          { name: 'No Ice (Chilled)', price: 0.0, isDefault: false },
          { name: 'Extra Hot (165°F)', price: 0.0, isDefault: false },
        ],
      },
    },
  });

  // 7. Create Products (Realistic Rupee Prices)
  const productsData = [
    {
      id: 'prod-latte',
      cafeId: cafe.id,
      categoryId: 'cat-hot-coffee',
      name: 'Velvet Vanilla Cafe Latte',
      sku: 'COF-LAT-001',
      description: 'Silky microfoam poured over rich espresso infused with Madagascar vanilla.',
      image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80',
      basePrice: 240.0,
      costPrice: 55.0,
      prepStation: 'BARISTA',
      prepTimeMinutes: 3,
      variants: [
        { name: 'Regular (12oz)', price: 240.0, sku: 'COF-LAT-001-REG' },
        { name: 'Large (16oz)', price: 290.0, sku: 'COF-LAT-001-LRG' },
      ],
      modifiers: ['mod-milk', 'mod-syrup', 'mod-espresso'],
    },
    {
      id: 'prod-cappuccino',
      cafeId: cafe.id,
      categoryId: 'cat-hot-coffee',
      name: 'Classic Italian Cappuccino',
      sku: 'COF-CAP-002',
      description: 'Equal thirds of bold espresso, steamed whole milk, and dense velvety crema dusting.',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80',
      basePrice: 220.0,
      costPrice: 48.0,
      prepStation: 'BARISTA',
      prepTimeMinutes: 3,
      variants: [
        { name: 'Regular (8oz)', price: 220.0, sku: 'COF-CAP-002-REG' },
        { name: 'Large (12oz)', price: 260.0, sku: 'COF-CAP-002-LRG' },
      ],
      modifiers: ['mod-milk', 'mod-espresso'],
    },
    {
      id: 'prod-flatwhite',
      cafeId: cafe.id,
      categoryId: 'cat-hot-coffee',
      name: 'Artisan Flat White',
      sku: 'COF-FLT-003',
      description: 'Ristretto espresso shots crowned with textured flat steamed milk.',
      image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80',
      basePrice: 230.0,
      costPrice: 52.0,
      prepStation: 'BARISTA',
      prepTimeMinutes: 3,
      variants: [
        { name: 'Standard (8oz)', price: 230.0, sku: 'COF-FLT-003-STD' },
      ],
      modifiers: ['mod-milk', 'mod-espresso'],
    },
    {
      id: 'prod-espresso',
      cafeId: cafe.id,
      categoryId: 'cat-hot-coffee',
      name: 'Doppio Espresso Signature',
      sku: 'COF-ESP-004',
      description: 'Double extraction of our single-origin blend with bright floral citrus and chocolate notes.',
      image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80',
      basePrice: 160.0,
      costPrice: 32.0,
      prepStation: 'BARISTA',
      prepTimeMinutes: 2,
      variants: [
        { name: 'Double Shot', price: 160.0, sku: 'COF-ESP-004-DBL' },
        { name: 'Triple Shot', price: 210.0, sku: 'COF-ESP-004-TRP' },
      ],
      modifiers: ['mod-espresso'],
    },
    {
      id: 'prod-nitro',
      cafeId: cafe.id,
      categoryId: 'cat-cold-brews',
      name: 'Nitro Cascade Cold Brew',
      sku: 'COL-NIT-005',
      description: 'Steeped for 20 hours and nitrogen-infused for a creamy cascading head and sweet finish.',
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      basePrice: 260.0,
      costPrice: 60.0,
      prepStation: 'BARISTA',
      prepTimeMinutes: 2,
      variants: [
        { name: 'Regular (12oz)', price: 260.0, sku: 'COL-NIT-005-REG' },
        { name: 'Large (16oz)', price: 310.0, sku: 'COL-NIT-005-LRG' },
      ],
      modifiers: ['mod-syrup', 'mod-temp'],
    },
    {
      id: 'prod-spanishlatte',
      cafeId: cafe.id,
      categoryId: 'cat-cold-brews',
      name: 'Iced Caramel Spanish Latte',
      sku: 'COL-SPN-006',
      description: 'Chilled espresso over sweet condensed milk, ice cubes, and drizzle of caramel.',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80',
      basePrice: 280.0,
      costPrice: 68.0,
      prepStation: 'BARISTA',
      prepTimeMinutes: 3,
      variants: [
        { name: 'Regular (16oz)', price: 280.0, sku: 'COL-SPN-006-REG' },
      ],
      modifiers: ['mod-milk', 'mod-temp', 'mod-espresso'],
    },
    {
      id: 'prod-matcha',
      cafeId: cafe.id,
      categoryId: 'cat-tea',
      name: 'Uji Ceremonial Matcha Latte',
      sku: 'TEA-MAT-007',
      description: 'Stone-ground green tea whisked with silky milk and subtle blossom honey.',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
      basePrice: 270.0,
      costPrice: 65.0,
      prepStation: 'BARISTA',
      prepTimeMinutes: 4,
      variants: [
        { name: 'Hot (12oz)', price: 270.0, sku: 'TEA-MAT-007-HOT' },
        { name: 'Iced (16oz)', price: 310.0, sku: 'TEA-MAT-007-ICE' },
      ],
      modifiers: ['mod-milk', 'mod-syrup'],
    },
    {
      id: 'prod-croissant',
      cafeId: cafe.id,
      categoryId: 'cat-bakery',
      name: 'Golden Almond Flake Croissant',
      sku: 'BAK-ALM-008',
      description: 'Twice-baked French butter croissant filled with almond frangipane and toasted sliced almonds.',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
      basePrice: 180.0,
      costPrice: 55.0,
      prepStation: 'BAKERY',
      prepTimeMinutes: 2,
      variants: [],
      modifiers: [],
    },
    {
      id: 'prod-brownie',
      cafeId: cafe.id,
      categoryId: 'cat-desserts',
      name: 'Fudgy Dark Chocolate Brownie',
      sku: 'DES-BRW-009',
      description: 'Decadent 72% Belgian dark chocolate studded with roasted walnuts and sea salt crystals.',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      basePrice: 190.0,
      costPrice: 50.0,
      prepStation: 'BAKERY',
      prepTimeMinutes: 1,
      variants: [],
      modifiers: [],
    },
    {
      id: 'prod-avocadotoast',
      cafeId: cafe.id,
      categoryId: 'cat-gourmet',
      name: 'Sourdough Avocado & Poached Egg Toast',
      sku: 'KIT-AVO-010',
      description: 'Toasted wild yeast sourdough, smashed Hass avocado, heirloom tomatoes, and microgreens.',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
      basePrice: 340.0,
      costPrice: 110.0,
      prepStation: 'KITCHEN',
      prepTimeMinutes: 8,
      variants: [],
      modifiers: [],
    },
    {
      id: 'prod-panini',
      cafeId: cafe.id,
      categoryId: 'cat-gourmet',
      name: 'Smoked Turkey & Truffle Brie Panini',
      sku: 'KIT-PAN-011',
      description: 'Herb-roasted smoked turkey, melted French brie, fig chutney, and baby arugula on ciabatta.',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
      basePrice: 380.0,
      costPrice: 130.0,
      prepStation: 'KITCHEN',
      prepTimeMinutes: 7,
      variants: [],
      modifiers: [],
    },
  ];

  for (const p of productsData) {
    const createdProduct = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        basePrice: p.basePrice,
        costPrice: p.costPrice,
        description: p.description,
        image: p.image,
        prepStation: p.prepStation,
        prepTimeMinutes: p.prepTimeMinutes,
      },
      create: {
        id: p.id,
        cafeId: cafe.id,
        categoryId: p.categoryId,
        name: p.name,
        sku: p.sku,
        description: p.description,
        image: p.image,
        basePrice: p.basePrice,
        costPrice: p.costPrice,
        prepStation: p.prepStation,
        prepTimeMinutes: p.prepTimeMinutes,
      },
    });

    // Delete existing variants and re-create for clean Rupee pricing
    await prisma.productVariant.deleteMany({ where: { productId: createdProduct.id } });
    for (const v of p.variants) {
      await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          name: v.name,
          price: v.price,
          sku: v.sku,
        },
      });
    }

    // Modifiers
    for (const modId of p.modifiers) {
      await prisma.productModifierGroup.upsert({
        where: {
          productId_modifierGroupId: {
            productId: createdProduct.id,
            modifierGroupId: modId,
          },
        },
        update: {},
        create: {
          productId: createdProduct.id,
          modifierGroupId: modId,
        },
      });
    }
  }

  // 8. Create Tables
  const tablesData = [
    { id: 'tbl-01', cafeId: cafe.id, tableNumber: 'T-01', capacity: 2, section: 'Indoor Main Hall', status: 'AVAILABLE' },
    { id: 'tbl-02', cafeId: cafe.id, tableNumber: 'T-02', capacity: 4, section: 'Indoor Main Hall', status: 'OCCUPIED' },
    { id: 'tbl-03', cafeId: cafe.id, tableNumber: 'T-03', capacity: 4, section: 'Indoor Main Hall', status: 'AVAILABLE' },
    { id: 'tbl-04', cafeId: cafe.id, tableNumber: 'T-04', capacity: 6, section: 'Indoor Main Hall', status: 'RESERVED' },
    { id: 'tbl-05', cafeId: cafe.id, tableNumber: 'Bar-01', capacity: 1, section: 'Window Espresso Bar', status: 'AVAILABLE' },
    { id: 'tbl-06', cafeId: cafe.id, tableNumber: 'Bar-02', capacity: 1, section: 'Window Espresso Bar', status: 'OCCUPIED' },
    { id: 'tbl-07', cafeId: cafe.id, tableNumber: 'Terrace-01', capacity: 4, section: 'Garden Terrace', status: 'AVAILABLE' },
    { id: 'tbl-08', cafeId: cafe.id, tableNumber: 'Terrace-02', capacity: 2, section: 'Garden Terrace', status: 'NEEDS_CLEANING' },
    { id: 'tbl-09', cafeId: cafe.id, tableNumber: 'Balcony-01', capacity: 4, section: 'Upper Balcony', status: 'AVAILABLE' },
  ];

  for (const tbl of tablesData) {
    await prisma.cafeTable.upsert({
      where: { id: tbl.id },
      update: tbl,
      create: tbl,
    });
  }

  // 9. Create Customers
  const customersData = [
    { id: 'cust-01', cafeId: cafe.id, name: 'Sophia Montgomery', phone: '+91 98201 10840', email: 'sophia.m@gmail.com', loyaltyPoints: 340, totalSpent: 12500.0, visitCount: 28 },
    { id: 'cust-02', cafeId: cafe.id, name: 'Julian Drake', phone: '+91 98201 29100', email: 'julian.d@outlook.com', loyaltyPoints: 120, totalSpent: 4800.0, visitCount: 12 },
    { id: 'cust-03', cafeId: cafe.id, name: 'Amara Chen', phone: '+91 98201 44320', email: 'amara.chen@techcorp.io', loyaltyPoints: 510, totalSpent: 18400.0, visitCount: 45 },
  ];

  for (const c of customersData) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }

  // 10. Create Coupons (Rupee values)
  const couponsData = [
    { id: 'coup-01', cafeId: cafe.id, code: 'COFFEE10', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 300.0, maxDiscount: 100.0, active: true },
    { id: 'coup-02', cafeId: cafe.id, code: 'MORNINGBREW', discountType: 'FIXED', discountValue: 50.0, minOrderValue: 200.0, active: true },
    { id: 'coup-03', cafeId: cafe.id, code: 'VIPWELCOME', discountType: 'PERCENTAGE', discountValue: 20, minOrderValue: 500.0, maxDiscount: 200.0, active: true },
  ];

  for (const coup of couponsData) {
    await prisma.coupon.upsert({
      where: { code: coup.code },
      update: coup,
      create: coup,
    });
  }

  // 11. Create Sample Orders for Kitchen, POS, and Dashboard Analytics (Rupee values)
  await prisma.order.upsert({
    where: { orderNumber: 'BD-1001' },
    update: {
      subtotal: 650.0,
      tax: 32.5,
      total: 682.5,
    },
    create: {
      id: 'ord-1001',
      cafeId: cafe.id,
      orderNumber: 'BD-1001',
      orderType: 'DINE_IN',
      tableId: 'tbl-02',
      customerId: 'cust-01',
      status: 'PREPARING',
      paymentStatus: 'PAID',
      subtotal: 650.0,
      discount: 0.0,
      tax: 32.5,
      total: 682.5,
      notes: 'Oat milk latte extra hot please.',
      createdById: 'user-cashier-01',
      items: {
        create: [
          {
            productName: 'Velvet Vanilla Cafe Latte',
            variantName: 'Large (16oz)',
            quantity: 1,
            unitPrice: 290.0,
            subtotal: 340.0,
            status: 'PREPARING',
            prepStation: 'BARISTA',
            notes: 'Extra hot, Oat milk',
            modifiers: {
              create: [
                { modifierOptionName: 'Oat Milk (Barista Blend)', price: 50.0 },
              ],
            },
          },
          {
            productName: 'Golden Almond Flake Croissant',
            quantity: 2,
            unitPrice: 180.0,
            subtotal: 360.0,
            status: 'READY',
            prepStation: 'BAKERY',
            notes: 'Warm on plate',
          },
        ],
      },
      payments: {
        create: [
          {
            method: 'CARD',
            amount: 682.5,
            status: 'COMPLETED',
            reference: 'tx_visa_9841',
          },
        ],
      },
    },
  });

  await prisma.order.upsert({
    where: { orderNumber: 'BD-1002' },
    update: {
      subtotal: 880.0,
      discount: 88.0,
      tax: 39.6,
      total: 831.6,
    },
    create: {
      id: 'ord-1002',
      cafeId: cafe.id,
      orderNumber: 'BD-1002',
      orderType: 'TAKEAWAY',
      customerId: 'cust-02',
      status: 'PLACED',
      paymentStatus: 'PAID',
      subtotal: 880.0,
      discount: 88.0,
      tax: 39.6,
      total: 831.6,
      notes: 'Takeaway bag with cup carrier.',
      createdById: 'user-cashier-01',
      items: {
        create: [
          {
            productName: 'Nitro Cascade Cold Brew',
            variantName: 'Large (16oz)',
            quantity: 1,
            unitPrice: 310.0,
            subtotal: 310.0,
            status: 'PENDING',
            prepStation: 'BARISTA',
          },
          {
            productName: 'Smoked Turkey & Truffle Brie Panini',
            quantity: 1,
            unitPrice: 380.0,
            subtotal: 380.0,
            status: 'PENDING',
            prepStation: 'KITCHEN',
            notes: 'Crispy toasted',
          },
          {
            productName: 'Fudgy Dark Chocolate Brownie',
            quantity: 1,
            unitPrice: 190.0,
            subtotal: 190.0,
            status: 'READY',
            prepStation: 'BAKERY',
          },
        ],
      },
      payments: {
        create: [
          {
            method: 'UPI',
            amount: 831.6,
            status: 'COMPLETED',
            reference: 'upi_ref_448102',
          },
        ],
      },
    },
  });

  // Completed order for metrics
  await prisma.order.upsert({
    where: { orderNumber: 'BD-0998' },
    update: {
      subtotal: 960.0,
      tax: 48.0,
      total: 1008.0,
    },
    create: {
      id: 'ord-0998',
      cafeId: cafe.id,
      orderNumber: 'BD-0998',
      orderType: 'DINE_IN',
      tableId: 'tbl-01',
      customerId: 'cust-03',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      subtotal: 960.0,
      discount: 0.0,
      tax: 48.0,
      total: 1008.0,
      createdById: 'user-cashier-01',
      items: {
        create: [
          { productName: 'Classic Italian Cappuccino', variantName: 'Regular (8oz)', quantity: 2, unitPrice: 220.0, subtotal: 440.0, status: 'SERVED', prepStation: 'BARISTA' },
          { productName: 'Sourdough Avocado & Poached Egg Toast', quantity: 1, unitPrice: 340.0, subtotal: 340.0, status: 'SERVED', prepStation: 'KITCHEN' },
          { productName: 'Golden Almond Flake Croissant', quantity: 1, unitPrice: 180.0, subtotal: 180.0, status: 'SERVED', prepStation: 'BAKERY' },
        ],
      },
      payments: {
        create: [
          { method: 'CASH', amount: 1008.0, tenderedAmount: 1100.0, changeAmount: 92.0, status: 'COMPLETED' },
        ],
      },
    },
  });

  // 12. Create Expenses (Rupees)
  await prisma.expense.deleteMany({ where: { cafeId: cafe.id } });
  const expensesData = [
    { cafeId: cafe.id, category: 'Coffee Beans & Supplies', amount: 12500.0, description: 'Weekly Ethiopian bean shipment from Heritage Roasters', approvedBy: 'Elena Vance' },
    { cafeId: cafe.id, category: 'Dairy & Milks', amount: 4800.0, description: 'Batch delivery of Barista Oat Milk and Whole Milk', approvedBy: 'Marcus Cole' },
    { cafeId: cafe.id, category: 'Utilities', amount: 8200.0, description: 'Monthly electricity & commercial water filtration maintenance', approvedBy: 'Elena Vance' },
    { cafeId: cafe.id, category: 'Equipment Maintenance', amount: 3500.0, description: 'Espresso machine group head gasket servicing', approvedBy: 'Marcus Cole' },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }

  // 13. Create Shift (Rupees)
  await prisma.shift.deleteMany({ where: { cafeId: cafe.id } });
  await prisma.shift.create({
    data: {
      cafeId: cafe.id,
      userId: 'user-cashier-01',
      startTime: new Date(Date.now() - 4 * 3600 * 1000),
      openingCash: 2000.0,
      status: 'OPEN',
      notes: 'Morning shift opening register drawer checked and balanced.',
    },
  });

  // 14. Create Reservations
  await prisma.reservation.deleteMany({ where: { cafeId: cafe.id } });
  const reservationsData = [
    {
      cafeId: cafe.id,
      tableId: 'tbl-04',
      customerName: 'Claire Redfield & Team',
      customerPhone: '+91 98200 44112',
      partySize: 5,
      reservationTime: new Date(Date.now() + 2 * 3600 * 1000),
      notes: 'Coffee tasting meeting and bakery platters.',
      status: 'CONFIRMED',
    },
    {
      cafeId: cafe.id,
      tableId: 'tbl-07',
      customerName: 'Harrison Ford',
      customerPhone: '+91 98200 77332',
      partySize: 2,
      reservationTime: new Date(Date.now() + 4 * 3600 * 1000),
      notes: 'Quiet terrace table requested.',
      status: 'CONFIRMED',
    },
  ];

  for (const res of reservationsData) {
    await prisma.reservation.create({ data: res });
  }

  console.log('--- Cafe Database Seeding with Rupee Currency Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
