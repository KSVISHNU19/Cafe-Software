# ☕ Cafe — Complete Cafe Management System

A modern, full-featured web-based cafe management software built with Next.js 14, TypeScript, Tailwind CSS, and Prisma ORM with SQLite.

---

## 🚀 Key Features

- **📊 Central Executive Dashboard**: Real-time sales metrics, active kitchen orders count, top-selling products, and low-inventory warnings.
- **🛒 Point of Sale (POS)**: Fast touch-friendly ordering interface, category switching, cart management, dine-in table assignments, and multi-payment checkout.
- **🍳 Kitchen Display System (KDS)**: Live kitchen ticket pipeline with preparation timers and instant status updates (`PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `COMPLETED`).
- **📋 Order History & Receipt Printing**: Complete order tracking, thermal-style receipts, status filtering, and refund handling.
- **🪑 Table & Floor Management**: Visual floor plan with real-time seat availability and status badges.
- **📦 Inventory & Stock Movements**: Ingredient-level tracking, minimum reorder thresholds, and adjustment audit logs (Usage, Spoilage, Restock).
- **🚚 Suppliers & Purchase Orders**: Supplier contact directory, purchase order generation, and 1-click receiving into inventory.
- **👥 Customers & Loyalty Ledger**: Customer directory, order history, and automatic welcome bonus & loyalty point accumulation.
- **📈 Reports & Analytics**: Date range filtering (Today, 7 Days, 30 Days, All), revenue breakdowns, and 1-click CSV export.
- **💸 Operational Expenses**: Daily operational & petty cash expense logging by category.
- **🧑‍🍳 Staff & Shift Management**: Clock-in/out, active shift tracking, opening/closing cash drawer balances, and discrepancy auditing.
- **⚙️ Store Settings**: Cafe details, tax configuration, and currency formatting (₹).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & ORM**: [Prisma](https://www.prisma.io/) with SQLite (`prisma/dev.db`)

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup & Seeding
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or configured port) in your browser.

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server
- `npm run build`: Generates Prisma client and creates production bundle
- `npm run start`: Starts production server
- `npm run prisma:generate`: Generates Prisma client
- `npm run prisma:push`: Pushes schema changes to SQLite database
- `npm run prisma:seed`: Seeds initial demo products, tables, staff, and cafe settings
