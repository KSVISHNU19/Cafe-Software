'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Tag,
  Coffee,
  IndianRupee,
  Clock,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function MenuPage() {
  const { showToast } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Product Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [prepStation, setPrepStation] = useState('BARISTA');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setProducts(data.products || []);
        setModifierGroups(data.modifierGroups || []);
        if (data.categories?.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Toggle Availability
  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, availability: !currentStatus }),
      });

      if (res.ok) {
        showToast({
          title: `Updated Product Availability`,
          type: 'info',
        });
        fetchMenu();
      }
    } catch {
      showToast({ title: 'Failed to update availability', type: 'error' });
    }
  };

  // Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !basePrice) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId,
          basePrice: Number(basePrice),
          costPrice: Number(costPrice) || 0,
          prepStation,
          description,
          image: image.trim() || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        }),
      });

      if (res.ok) {
        showToast({ title: `Added "${name}" to Menu`, type: 'success' });
        setAddModalOpen(false);
        setName('');
        setBasePrice('');
        setCostPrice('');
        setDescription('');
        setImage('');
        fetchMenu();
      } else {
        const err = await res.json();
        showToast({ title: 'Error adding item', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Submission error', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'ALL' || p.categoryId === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-[#2C211B] font-heading">
            Menu Catalog & Pricing Management
          </h2>
          <p className="text-xs text-stone-500">
            Configure drinks, snacks, prices, recipe ingredient consumption, and station assignments.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-[#C68B59]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#EADCC9] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-[#3B261B] text-white shadow-xs'
                : 'bg-[#FAF4EC] text-stone-700 hover:bg-[#F5EBDD]'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[#3B261B] text-white shadow-xs'
                  : 'bg-[#FAF4EC] text-stone-700 hover:bg-[#F5EBDD]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-stone-200/60 rounded-3xl animate-pulse" />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-400">
            No products match this filter.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const margin =
              p.basePrice > 0
                ? (((p.basePrice - p.costPrice) / p.basePrice) * 100).toFixed(0)
                : '0';

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-[#EADCC9] p-4 shadow-subtle flex flex-col justify-between hover:border-[#C68B59] transition-all"
              >
                <div>
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-stone-100 mb-3">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#3B261B]/80 text-[#FFFDF8] backdrop-blur-xs">
                      {p.category?.name}
                    </span>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-900/80 text-white backdrop-blur-xs">
                      {p.prepStation}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#2C211B]">{p.name}</h4>
                  <p className="text-[10px] text-stone-400">{p.sku}</p>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                    {p.description || 'Artisan handcrafted recipe.'}
                  </p>

                  {/* Variants Pills */}
                  {p.variants && p.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.variants.map((v: any) => (
                        <span
                          key={v.id}
                          className="text-[9px] font-semibold bg-[#FAF4EC] text-[#6F4E37] px-1.5 py-0.5 rounded border border-[#EADCC9]"
                        >
                          {v.name}: {formatCurrency(v.price)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Pricing & Availability */}
                <div className="mt-4 pt-3 border-t border-[#F5EBDD] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#3B261B]">
                      {formatCurrency(p.basePrice)}
                    </span>
                    <span className="text-[10px] text-emerald-700 ml-1 font-semibold">
                      ({margin}% margin)
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleAvailability(p.id, p.availability)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                      p.availability
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {p.availability ? 'Available' : 'Archived'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateProduct}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">Create New Menu Item</h3>
                <p className="text-xs text-stone-500">Add drink, bakery, or kitchen item</p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honey Lavender Cold Brew"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#8D674A] block mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#8D674A] block mb-1">Prep Station</label>
                  <select
                    value={prepStation}
                    onChange={(e) => setPrepStation(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                  >
                    <option value="BARISTA">Coffee Barista</option>
                    <option value="KITCHEN">Kitchen Grill</option>
                    <option value="BAKERY">Bakery Station</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#8D674A] block mb-1">Retail Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="240.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#8D674A] block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="60.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Image URL (Unsplash)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Flavor Notes & Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe tasting notes, brew method, origins..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F5EBDD]">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Saving...' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
