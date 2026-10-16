'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  X,
  History,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function InventoryPage() {
  const { showToast, refreshStats } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'MOVEMENTS'>('ITEMS');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [movementType, setMovementType] = useState('USAGE');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setMovements(data.movements || []);
        setLowStockItems(data.lowStockItems || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          movementType,
          quantity: Number(quantity),
          reason: reason.trim() || 'Manual stock update',
        }),
      });

      if (res.ok) {
        showToast({
          title: `Stock adjusted for ${selectedItem.name}`,
          type: 'success',
        });
        setAdjustModalOpen(false);
        setQuantity('');
        setReason('');
        fetchInventory();
        refreshStats();
      } else {
        const err = await res.json();
        showToast({ title: 'Adjustment failed', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Error adjusting stock', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-[#2C211B] font-heading">
            Inventory & Ingredient Control
          </h2>
          <p className="text-xs text-stone-500">
            Track raw coffee beans, dairy, syrups, packaging cups, and automated recipe deductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#DCC8AF]">
            <button
              onClick={() => setActiveTab('ITEMS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'ITEMS' ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Stock Items ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('MOVEMENTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'MOVEMENTS' ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Movement Ledger
            </button>
          </div>

          <Link
            href="/suppliers"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C68B59] hover:bg-[#b57a48] text-white font-bold text-xs shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Truck className="w-4 h-4" />
            <span>Supplier Orders</span>
          </Link>
        </div>
      </div>

      {/* Low Stock Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-rose-950">
                Low Stock Warning ({lowStockItems.length} Items Below Reorder Level)
              </h3>
            </div>
            <Link href="/suppliers" className="text-xs font-bold text-rose-800 underline">
              Draft Purchase Orders →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-xl border border-rose-200 text-xs flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-[#2C211B]">{item.name}</p>
                  <p className="text-[11px] text-rose-600 font-semibold">
                    Current: {item.currentStock} {item.unit} (Min: {item.reorderLevel})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setMovementType('PURCHASE');
                    setAdjustModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg font-bold text-[10px]"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: STOCK ITEMS TABLE */}
      {activeTab === 'ITEMS' && (
        <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle overflow-hidden">
          {/* Search toolbar */}
          <div className="p-4 border-b border-[#F5EBDD] flex items-center justify-between bg-[#FAF6F0]">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ingredients, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DCC8AF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
              />
            </div>

            <button
              onClick={fetchInventory}
              className="p-2 rounded-xl text-[#6F4E37] hover:bg-[#F5EBDD] transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] border-b border-[#EADCC9] text-[#8D674A]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Ingredient Name</th>
                  <th className="py-3.5 px-4 font-bold">SKU</th>
                  <th className="py-3.5 px-4 font-bold">Current Stock</th>
                  <th className="py-3.5 px-4 font-bold">Reorder Level</th>
                  <th className="py-3.5 px-4 font-bold">Cost / Unit</th>
                  <th className="py-3.5 px-4 font-bold">Primary Supplier</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBDD] font-medium">
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.reorderLevel;

                  return (
                    <tr key={item.id} className="hover:bg-[#FAF4EC]/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#2C211B]">{item.name}</td>
                      <td className="py-3.5 px-4 text-stone-500">{item.sku}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold text-xs ${
                            isLow ? 'text-rose-600' : 'text-stone-800'
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                        {isLow && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {item.reorderLevel} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-700">
                        {formatCurrency(item.costPerUnit)} / {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {item.supplier?.name || 'Local Wholesale'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setMovementType('USAGE');
                            setAdjustModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#6F4E37] font-bold text-[11px] border border-[#DCC8AF] transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MOVEMENT LEDGER */}
      {activeTab === 'MOVEMENTS' && (
        <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5EBDD] pb-3">
            <h3 className="font-bold text-base text-[#3B261B]">Audit Movement Ledger</h3>
            <span className="text-xs text-stone-500 font-medium">Recent 30 adjustments</span>
          </div>

          <div className="divide-y divide-[#F5EBDD]">
            {movements.length === 0 ? (
              <p className="py-8 text-center text-xs text-stone-400">No stock movements recorded.</p>
            ) : (
              movements.map((mov) => (
                <div key={mov.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        mov.quantity > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {mov.quantity > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#2C211B]">
                        {mov.inventoryItem?.name || 'Ingredient'}
                      </p>
                      <p className="text-stone-500 text-[11px]">
                        Type: <span className="font-semibold text-stone-700">{mov.movementType}</span> • Reason: {mov.reason || 'Manual'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold text-sm ${
                        mov.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} {mov.inventoryItem?.unit}
                    </p>
                    <p className="text-[10px] text-stone-400">{formatDateTime(mov.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {adjustModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleAdjustStock}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">Adjust Stock Level</h3>
                <p className="text-xs text-stone-500">{selectedItem.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF6F0] rounded-2xl flex justify-between items-center">
                <span className="text-stone-600 font-medium">Current Balance:</span>
                <span className="font-bold text-sm text-[#3B261B]">
                  {selectedItem.currentStock} {selectedItem.unit}
                </span>
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Adjustment Type</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                >
                  <option value="PURCHASE">Stock In / Purchase (+)</option>
                  <option value="USAGE">Usage / Barista Consumption (-)</option>
                  <option value="WASTAGE">Wastage / Spoilage (-)</option>
                  <option value="RETURN">Supplier Return (+)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">
                  Quantity ({selectedItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5.0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Reason / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Barista milk frothing spill / batch roasting"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F5EBDD]">
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Recording...' : 'Save Stock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
