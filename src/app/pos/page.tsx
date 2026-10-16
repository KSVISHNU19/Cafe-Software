'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Coffee,
  ShoppingBag,
  CreditCard,
  User,
  Tag,
  CheckCircle2,
  Printer,
  X,
  Layers,
  ChevronRight,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export interface CartModifier {
  modifierOptionName: string;
  price: number;
}

export interface CartItem {
  id: string; // unique item uuid in cart
  productId: string;
  productName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  modifiers: CartModifier[];
  notes?: string;
  prepStation?: string;
}

export default function POSPage() {
  const { showToast, refreshStats, currentUser } = useApp();

  // Catalog State
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  // Discounts
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Modals
  const [customizingProduct, setCustomizingProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<CartModifier[]>([]);
  const [customNotes, setCustomNotes] = useState('');

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [tenderedAmount, setTenderedAmount] = useState<string>('');

  // Receipt Modal
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Menu, Tables, Customers
  useEffect(() => {
    async function initPOS() {
      try {
        setLoading(true);
        const [menuRes, tblRes, custRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/tables'),
          fetch('/api/customers'),
        ]);

        if (menuRes.ok) {
          const m = await menuRes.json();
          setCategories(m.categories || []);
          setProducts(m.products || []);
        }

        if (tblRes.ok) {
          const t = await tblRes.json();
          setTables(t.tables || []);
          const avail = (t.tables || []).find((tb: any) => tb.status === 'AVAILABLE');
          if (avail) setSelectedTable(avail);
        }

        if (custRes.ok) {
          const c = await custRes.json();
          setCustomers(c.customers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    initPOS();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      activeCategory === 'ALL' || prod.categoryId === activeCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && prod.availability !== false;
  });

  // Open Customization Modal
  const handleSelectProduct = (product: any) => {
    // If product has variants or modifiers, open modal; otherwise quick add
    const hasVariants = product.variants && product.variants.length > 0;
    const hasModifiers = product.productModifiers && product.productModifiers.length > 0;

    if (hasVariants || hasModifiers) {
      setCustomizingProduct(product);
      setSelectedVariant(hasVariants ? product.variants[0] : null);
      setSelectedModifiers([]);
      setCustomNotes('');
    } else {
      // Direct quick add
      addToCartDirect(product);
    }
  };

  const addToCartDirect = (product: any) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      productName: product.name,
      unitPrice: product.basePrice,
      quantity: 1,
      modifiers: [],
      prepStation: product.prepStation,
    };
    setCart((prev) => [...prev, newItem]);
    showToast({
      title: `Added ${product.name}`,
      type: 'success',
    });
  };

  const handleConfirmCustomization = () => {
    if (!customizingProduct) return;

    const basePrice = selectedVariant
      ? selectedVariant.price
      : customizingProduct.basePrice;

    const newItem: CartItem = {
      id: Math.random().toString(36).substring(2, 9),
      productId: customizingProduct.id,
      productName: customizingProduct.name,
      variantName: selectedVariant ? selectedVariant.name : undefined,
      unitPrice: basePrice,
      quantity: 1,
      modifiers: selectedModifiers,
      notes: customNotes.trim() || undefined,
      prepStation: customizingProduct.prepStation,
    };

    setCart((prev) => [...prev, newItem]);
    setCustomizingProduct(null);
    showToast({
      title: `Added ${newItem.productName}`,
      message: newItem.variantName ? `Size: ${newItem.variantName}` : undefined,
      type: 'success',
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const modTotal = item.modifiers.reduce((mAcc, m) => mAcc + m.price, 0);
    return acc + (item.unitPrice + modTotal) * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = parseFloat(((taxableAmount * 8.5) / 100).toFixed(2));
  const total = parseFloat((taxableAmount + tax).toFixed(2));

  // Apply Coupon
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'COFFEE10') {
      setAppliedCoupon({ code: 'COFFEE10', discountType: 'PERCENTAGE', discountValue: 10, maxDiscount: 5.0 });
      showToast({ title: '10% Coffee Promo Applied', type: 'success' });
    } else if (code === 'MORNINGBREW') {
      setAppliedCoupon({ code: 'MORNINGBREW', discountType: 'FIXED', discountValue: 50.0 });
      showToast({ title: '₹50 Off Applied', type: 'success' });
    } else if (code === 'VIPWELCOME') {
      setAppliedCoupon({ code: 'VIPWELCOME', discountType: 'PERCENTAGE', discountValue: 20 });
      showToast({ title: '20% VIP Welcome Applied', type: 'success' });
    } else {
      showToast({ title: 'Invalid Coupon Code', message: 'Try COFFEE10 or MORNINGBREW', type: 'warning' });
    }
  };

  // Checkout
  const handleProcessCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        orderType,
        tableId: orderType === 'DINE_IN' ? selectedTable?.id : null,
        customerId: selectedCustomer?.id || null,
        items: cart,
        discount: discountAmount,
        paymentMethod,
        tenderedAmount: paymentMethod === 'CASH' && tenderedAmount ? Number(tenderedAmount) : total,
        createdById: currentUser.id,
      };

      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Checkout failed');
      }

      const data = await res.json();
      setCompletedOrder(data.order);
      setCart([]);
      setAppliedCoupon(null);
      setCouponCode('');
      setPaymentModalOpen(false);
      refreshStats();

      showToast({
        title: `Order ${data.orderNumber} Completed!`,
        message: `Sent to Kitchen • Total: ${formatCurrency(data.total)}`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Checkout Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cashChange = paymentMethod === 'CASH' && tenderedAmount
    ? Math.max(0, Number(tenderedAmount) - total)
    : 0;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#FAF6F0] overflow-hidden">
      {/* LEFT/CENTER: PRODUCT CATALOG */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#EADCC9] overflow-hidden">
        {/* Top Filter & Search Bar */}
        <div className="p-4 bg-white border-b border-[#EADCC9] flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === 'ALL'
                  ? 'bg-[#3B261B] text-white shadow-sm'
                  : 'bg-[#FAF4EC] text-stone-700 hover:bg-[#F5EBDD]'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#3B261B] text-white shadow-sm'
                    : 'bg-[#FAF4EC] text-stone-700 hover:bg-[#F5EBDD]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coffee, tea, bakery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-stone-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-sm">
              <Coffee className="w-10 h-10 mb-2 text-stone-300" />
              No menu items match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const hasVariants = product.variants && product.variants.length > 0;
                const hasModifiers = product.productModifiers && product.productModifiers.length > 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="group bg-white rounded-2xl border border-[#EADCC9] p-3 shadow-subtle hover:shadow-card hover:border-[#C68B59] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 mb-2.5">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#3B261B]/80 text-[#FFFDF8] backdrop-blur-xs">
                          {product.category?.name || 'Beverage'}
                        </span>
                        {(hasVariants || hasModifiers) && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-[#C68B59] text-white shadow-xs">
                            Customizable
                          </span>
                        )}
                      </div>

                      {/* Title & SKU */}
                      <h4 className="text-xs font-bold text-[#2C211B] line-clamp-1 group-hover:text-[#6F4E37] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                        {product.description || product.sku}
                      </p>
                    </div>

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5EBDD]">
                      <div>
                        <span className="text-xs font-bold text-[#3B261B]">
                          {formatCurrency(product.basePrice)}
                        </span>
                        {hasVariants && (
                          <span className="text-[10px] text-stone-400 ml-1">+ sizes</span>
                        )}
                      </div>
                      <button
                        className="w-7 h-7 rounded-lg bg-[#FAF4EC] group-hover:bg-[#C68B59] group-hover:text-white text-[#6F4E37] flex items-center justify-center transition-colors shadow-xs"
                        aria-label={`Add ${product.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: POS CART & BILLING PANEL */}
      <div className="w-full lg:w-[420px] bg-[#FFFDF8] flex flex-col justify-between shrink-0 shadow-xl border-l border-[#EADCC9]">
        {/* Cart Header & Order Type */}
        <div className="p-4 border-b border-[#EADCC9] space-y-3 shrink-0">
          {/* Order Type Toggle */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF6F0] rounded-xl border border-[#DCC8AF]/60">
            {(['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  orderType === type
                    ? 'bg-[#3B261B] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {type === 'DINE_IN' ? 'Dine In' : type === 'TAKEAWAY' ? 'Takeaway' : 'Delivery'}
              </button>
            ))}
          </div>

          {/* Table / Customer Selector Bar */}
          <div className="flex items-center gap-2">
            {orderType === 'DINE_IN' && (
              <button
                onClick={() => setTableModalOpen(true)}
                className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF4EC] border border-[#DCC8AF] text-xs hover:border-[#C68B59] transition-colors"
              >
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="font-semibold text-[#3B261B]">
                    {selectedTable ? `Table: ${selectedTable.tableNumber}` : 'Select Table'}
                  </span>
                  {selectedTable && (
                    <span className="text-[10px] text-stone-500">
                      ({selectedTable.section} • {selectedTable.capacity}p)
                    </span>
                  )}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            )}

            {/* Customer Attachment */}
            <button
              onClick={() => setCustomerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF4EC] border border-[#DCC8AF] text-xs text-stone-700 hover:border-[#C68B59] transition-colors shrink-0"
              title="Add Customer for Loyalty Points"
            >
              <User className="w-3.5 h-3.5 text-[#6F4E37]" />
              <span className="font-medium">
                {selectedCustomer ? selectedCustomer.name.split(' ')[0] : 'Guest'}
              </span>
              {selectedCustomer && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                  {selectedCustomer.loyaltyPoints} pts
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs">
              <ShoppingBag className="w-10 h-10 mb-2 text-[#DCC8AF]" />
              <p className="font-semibold text-stone-600">Cart is empty</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Select menu items from the left to start order</p>
            </div>
          ) : (
            cart.map((item) => {
              const modTotal = item.modifiers.reduce((acc, m) => acc + m.price, 0);
              const itemLineTotal = (item.unitPrice + modTotal) * item.quantity;

              return (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-xl border border-[#EADCC9] shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-[#2C211B]">{item.productName}</p>
                        {item.variantName && (
                          <span className="text-[10px] font-semibold bg-[#F5EBDD] text-[#6F4E37] px-1.5 py-0.2 rounded">
                            {item.variantName}
                          </span>
                        )}
                      </div>
                      {/* Modifiers List */}
                      {item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.modifiers.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className="text-[9px] font-medium bg-[#FAF4EC] text-stone-600 px-1.5 py-0.5 rounded border border-[#EADCC9]/50"
                            >
                              +{m.modifierOptionName} ({formatCurrency(m.price)})
                            </span>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <p className="text-[10px] text-amber-800 italic mt-0.5">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-bold text-[#3B261B]">
                      {formatCurrency(itemLineTotal)}
                    </span>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#F5EBDD]/60 text-xs">
                    <span className="text-[11px] text-stone-500">
                      {formatCurrency(item.unitPrice + modTotal)} each
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-[#FAF4EC] hover:bg-[#F5EBDD] text-stone-700 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-[#FAF4EC] hover:bg-[#F5EBDD] text-stone-700 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded-lg text-stone-400 hover:text-rose-600 flex items-center justify-center ml-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Cart Calculations & Checkout */}
        <div className="p-4 bg-white border-t border-[#EADCC9] space-y-3 shrink-0">
          {/* Coupon / Promo Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Promo (COFFEE10 / MORNINGBREW)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl uppercase font-semibold text-stone-800 placeholder:normal-case placeholder:font-normal focus:outline-none"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              className="px-3 py-1.5 rounded-xl bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#6F4E37] text-xs font-bold border border-[#DCC8AF]"
            >
              Apply
            </button>
          </div>

          {appliedCoupon && (
            <div className="flex items-center justify-between text-xs px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
              <span>Promo {appliedCoupon.code}</span>
              <button
                onClick={() => setAppliedCoupon(null)}
                className="text-[10px] font-bold text-emerald-900 underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (8.5%)</span>
              <span className="font-semibold text-stone-800">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#2C211B] pt-1.5 border-t border-[#EADCC9]">
              <span>Final Total</span>
              <span className="text-base text-[#3B261B]">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => setPaymentModalOpen(true)}
            disabled={cart.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform ${
              cart.length > 0
                ? 'bg-gradient-to-r from-[#3B261B] to-[#6F4E37] text-white hover:-translate-y-0.5'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#C68B59]" />
            <span>Charge {formatCurrency(total)}</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: PRODUCT CUSTOMIZATION (Modifiers & Variants) */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#F5EBDD] flex items-center justify-between bg-[#FAF6F0]">
              <div>
                <h3 className="font-bold text-sm text-[#2C211B]">{customizingProduct.name}</h3>
                <p className="text-xs text-stone-500">Customize drink options & preparation</p>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Variants / Sizes */}
              {customizingProduct.variants && customizingProduct.variants.length > 0 && (
                <div>
                  <label className="font-bold text-[#8D674A] uppercase tracking-wider block mb-2">
                    Select Size / Variant
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingProduct.variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-2.5 rounded-xl border text-left font-medium transition-colors ${
                          selectedVariant?.id === v.id
                            ? 'bg-[#3B261B] text-white border-[#3B261B]'
                            : 'bg-[#FAF4EC] text-stone-800 border-[#DCC8AF] hover:bg-[#F5EBDD]'
                        }`}
                      >
                        <p className="font-semibold">{v.name}</p>
                        <p className={`text-[11px] ${selectedVariant?.id === v.id ? 'text-[#DCC8AF]' : 'text-stone-500'}`}>
                          {formatCurrency(v.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Modifier Groups */}
              {customizingProduct.productModifiers?.map((link: any) => {
                const group = link.modifierGroup;
                if (!group) return null;

                return (
                  <div key={group.id} className="pt-2 border-t border-[#F5EBDD]">
                    <label className="font-bold text-[#8D674A] uppercase tracking-wider block mb-2">
                      {group.name}
                    </label>
                    <div className="space-y-1.5">
                      {group.options?.map((opt: any) => {
                        const isSelected = selectedModifiers.some(
                          (m) => m.modifierOptionName === opt.name
                        );

                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedModifiers((prev) =>
                                  prev.filter((m) => m.modifierOptionName !== opt.name)
                                );
                              } else {
                                // If max selections is 1, replace other options in this group
                                if (group.maxSelections === 1) {
                                  const groupOptionNames = group.options.map((o: any) => o.name);
                                  setSelectedModifiers((prev) => [
                                    ...prev.filter((m) => !groupOptionNames.includes(m.modifierOptionName)),
                                    { modifierOptionName: opt.name, price: opt.price },
                                  ]);
                                } else {
                                  setSelectedModifiers((prev) => [
                                    ...prev,
                                    { modifierOptionName: opt.name, price: opt.price },
                                  ]);
                                }
                              }
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#FAF4EC] border-[#C68B59] text-[#3B261B] font-semibold'
                                : 'bg-white border-[#EADCC9] text-stone-700 hover:bg-[#FAF4EC]'
                            }`}
                          >
                            <span>{opt.name}</span>
                            <span className="font-bold text-stone-600">
                              {opt.price > 0 ? `+${formatCurrency(opt.price)}` : 'Included'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Barista Preparation Notes */}
              <div className="pt-2 border-t border-[#F5EBDD]">
                <label className="font-bold text-[#8D674A] uppercase tracking-wider block mb-1">
                  Preparation Notes for Barista
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra hot, light foam, half sweet..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#F5EBDD] bg-[#FAF6F0] flex justify-end gap-2">
              <button
                onClick={() => setCustomizingProduct(null)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200/60 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCustomization}
                className="px-5 py-2 rounded-xl bg-[#3B261B] text-white font-bold hover:bg-[#4A3023] shadow-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TABLE SELECTOR */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EADCC9] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">Assign Dine-In Table</h3>
                <p className="text-xs text-stone-500">Pick an available table for this party</p>
              </div>
              <button
                onClick={() => setTableModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTable(t);
                    setTableModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedTable?.id === t.id
                      ? 'border-[#3B261B] ring-2 ring-[#C68B59] bg-[#FAF4EC]'
                      : 'border-[#EADCC9] bg-white hover:border-[#C68B59]'
                  }`}
                >
                  <p className="font-bold text-sm text-[#2C211B]">{t.tableNumber}</p>
                  <p className="text-[11px] text-stone-500">{t.capacity} Seats</p>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      t.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'OCCUPIED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {t.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CUSTOMER SELECTOR */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">Customer Loyalty Lookup</h3>
                <p className="text-xs text-stone-500">Attach customer to earn & redeem points</p>
              </div>
              <button
                onClick={() => setCustomerModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerModalOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left text-xs font-semibold ${
                  !selectedCustomer ? 'bg-[#3B261B] text-white' : 'bg-[#FAF4EC] text-stone-700'
                }`}
              >
                Anonymous Guest (No Loyalty Profile)
              </button>

              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomer(c);
                    setCustomerModalOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                    selectedCustomer?.id === c.id
                      ? 'border-[#3B261B] bg-[#FAF4EC] font-bold'
                      : 'border-[#EADCC9] bg-white hover:bg-[#FAF4EC]'
                  }`}
                >
                  <div>
                    <p className="font-bold text-[#2C211B]">{c.name}</p>
                    <p className="text-[11px] text-stone-500">{c.phone || c.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-700">{c.loyaltyPoints} Points</span>
                    <p className="text-[10px] text-stone-400">{c.visitCount} visits</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PAYMENT CHECKOUT DIALOG */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#3B261B]">Payment Settlement</h3>
                <p className="text-xs text-stone-500">Order Total: {formatCurrency(total)}</p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['CASH', 'CARD', 'UPI'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-3 px-2 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === method
                      ? 'bg-[#3B261B] text-white border-[#3B261B] shadow-sm'
                      : 'bg-[#FAF4EC] text-stone-700 border-[#DCC8AF] hover:bg-[#F5EBDD]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#C68B59]" />
                  <span>{method === 'CASH' ? 'Cash' : method === 'CARD' ? 'Card / POS' : 'UPI / QR'}</span>
                </button>
              ))}
            </div>

            {/* Cash Tendered & Change calculator */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3 p-4 bg-[#FAF6F0] rounded-2xl border border-[#EADCC9]">
                <label className="text-xs font-bold text-[#8D674A] uppercase tracking-wider block">
                  Amount Tendered (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={total.toString()}
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  className="w-full p-2.5 text-base font-bold text-stone-900 bg-white border border-[#DCC8AF] rounded-xl focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                />

                {/* Quick denomination chips */}
                <div className="flex gap-2">
                  {[total, 100, 200, 500].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTenderedAmount(typeof amt === 'number' ? amt.toFixed(2) : amt)}
                      className="flex-1 py-1 text-xs font-semibold bg-white border border-[#DCC8AF] rounded-lg hover:bg-[#F5EBDD] text-stone-700"
                    >
                      ₹{typeof amt === 'number' ? amt.toFixed(0) : amt}
                    </button>
                  ))}
                </div>

                {/* Change Calculated */}
                <div className="flex justify-between items-center pt-2 border-t border-[#EADCC9] text-xs">
                  <span className="font-semibold text-stone-600">Change Due:</span>
                  <span className="text-base font-bold text-emerald-700">
                    {formatCurrency(cashChange)}
                  </span>
                </div>
              </div>
            )}

            {/* Card / UPI Notice */}
            {paymentMethod !== 'CASH' && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Terminal Ready (Development Mode)
                </p>
                <p className="text-[11px] text-emerald-700">
                  Transaction authorization simulated successfully for testing.
                </p>
              </div>
            )}

            {/* Complete Payment Button */}
            <button
              onClick={handleProcessCheckout}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3B261B] to-[#6F4E37] text-white font-bold text-sm shadow-md hover:opacity-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Authorizing & Recording...</span>
              ) : (
                <>
                  <span>Complete Payment ({formatCurrency(total)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: PRINTABLE THERMAL RECEIPT */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-[#2C211B]">Order Confirmed!</h3>
            <p className="text-xs text-stone-500">
              Order <span className="font-bold text-[#3B261B]">{completedOrder.orderNumber}</span> has been sent to the Kitchen queue.
            </p>

            {/* Printable Receipt Preview Layout */}
            <div
              id="printable-receipt"
              className="p-4 bg-[#FFFDF8] border border-dashed border-stone-300 rounded-xl text-left font-mono text-[11px] text-stone-800 space-y-2"
            >
              <div className="text-center border-b pb-2">
                <h4 className="font-bold text-xs uppercase">Cafe Artisan Roasters</h4>
                <p className="text-[10px] text-stone-500">142 Espresso Blvd, Downtown</p>
                <p className="text-[10px] text-stone-500">Tel: +1 (555) 382-7400</p>
              </div>

              <div className="flex justify-between text-[10px] pt-1 border-b pb-1">
                <span>{completedOrder.orderNumber}</span>
                <span>{formatDateTime(completedOrder.createdAt)}</span>
              </div>
              <p className="text-[10px] font-bold">
                TYPE: {completedOrder.orderType}{' '}
                {completedOrder.table ? `• Table ${completedOrder.table.tableNumber}` : ''}
              </p>

              <div className="space-y-1 py-1 border-b">
                {completedOrder.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <div>
                      <span>
                        {it.quantity}x {it.productName}
                      </span>
                      {it.variantName && <span className="text-[9px]"> ({it.variantName})</span>}
                    </div>
                    <span>{formatCurrency(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 pt-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Discount:</span>
                    <span>-{formatCurrency(completedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (8.5%):</span>
                  <span>{formatCurrency(completedOrder.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(completedOrder.total)}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[9px] text-stone-500 border-t">
                <p>Wi-Fi: CafeGuest / Pass: velvetcrema</p>
                <p>Thank you for supporting artisan coffee!</p>
              </div>
            </div>

            {/* Actions: Print or Next Order */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#DCC8AF] bg-[#FAF4EC] hover:bg-[#F5EBDD] font-bold text-xs text-[#3B261B] flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#C68B59]" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] font-bold text-xs text-white"
              >
                Next Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
