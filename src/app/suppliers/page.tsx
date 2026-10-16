'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  PackageCheck,
  Building,
  Phone,
  Mail,
  RefreshCw,
  X,
  Boxes,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function SuppliersPage() {
  const { showToast, refreshStats } = useApp();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'POS' | 'SUPPLIERS'>('POS');
  const [loading, setLoading] = useState(true);

  // New PO Modal
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poItems, setPoItems] = useState<{ inventoryItemId: string; quantity: number; unitCost: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
        setPurchaseOrders(data.purchaseOrders || []);
        setInventoryItems(data.inventoryItems || []);
        if (data.suppliers?.length > 0 && !selectedSupplierId) {
          setSelectedSupplierId(data.suppliers[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1-Click Receive Goods
  const handleReceivePO = async (poId: string) => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseOrderId: poId, action: 'RECEIVE' }),
      });

      if (res.ok) {
        showToast({
          title: 'Goods Received Successfully',
          message: 'Ingredient inventory quantities have been incremented.',
          type: 'success',
        });
        fetchData();
        refreshStats();
      } else {
        const err = await res.json();
        showToast({ title: 'Failed to receive goods', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Error processing receipt', type: 'error' });
    }
  };

  // Add Item Line to PO
  const handleAddItemToPO = () => {
    if (inventoryItems.length === 0) return;
    const defaultItem = inventoryItems[0];
    setPoItems((prev) => [
      ...prev,
      {
        inventoryItemId: defaultItem.id,
        quantity: 10,
        unitCost: defaultItem.costPerUnit || 10,
      },
    ]);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || poItems.length === 0) {
      showToast({ title: 'Please select a supplier and add at least one item', type: 'warning' });
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          items: poItems,
          notes,
        }),
      });

      if (res.ok) {
        showToast({ title: 'Purchase Order Created', type: 'success' });
        setPoModalOpen(false);
        setPoItems([]);
        setNotes('');
        fetchData();
      } else {
        const err = await res.json();
        showToast({ title: 'Failed to create PO', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Error creating purchase order', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-[#2C211B] font-heading">
            Suppliers & Purchase Orders
          </h2>
          <p className="text-xs text-stone-500">
            Manage roasters, organic dairy suppliers, purchase orders, and goods receiving.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#DCC8AF]">
            <button
              onClick={() => setActiveTab('POS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'POS' ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('SUPPLIERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'SUPPLIERS' ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Supplier Directory ({suppliers.length})
            </button>
          </div>

          <button
            onClick={() => {
              handleAddItemToPO();
              setPoModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C68B59] hover:bg-[#b57a48] text-white font-bold text-xs shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create PO</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PURCHASE ORDERS LIST */}
      {activeTab === 'POS' && (
        <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-[#F5EBDD] flex items-center justify-between bg-[#FAF6F0]">
            <h3 className="font-bold text-sm text-[#3B261B]">Purchase Orders</h3>
            <button
              onClick={fetchData}
              className="p-1.5 rounded-xl text-[#6F4E37] hover:bg-[#F5EBDD] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] border-b border-[#EADCC9] text-[#8D674A]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">PO Number</th>
                  <th className="py-3.5 px-4 font-bold">Supplier</th>
                  <th className="py-3.5 px-4 font-bold">Items Ordered</th>
                  <th className="py-3.5 px-4 font-bold">Total Cost</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Created Date</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBDD] font-medium">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      No purchase orders yet. Create your first PO above.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-[#FAF4EC]/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#3B261B]">{po.poNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-stone-800">
                        {po.supplier?.name}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {po.items?.map((it: any) => `${it.quantity}x ${it.inventoryItem?.name}`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#2C211B]">
                        {formatCurrency(po.totalCost)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {formatDateTime(po.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {po.status === 'PENDING' && (
                          <button
                            onClick={() => handleReceivePO(po.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 ml-auto"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Receive Goods</span>
                          </button>
                        )}
                        {po.status === 'RECEIVED' && (
                          <span className="text-[11px] text-stone-400 font-semibold">
                            Received {formatDateTime(po.receivedAt)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS DIRECTORY */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white rounded-3xl border border-[#EADCC9] p-5 shadow-subtle space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#2C211B]">{sup.name}</h3>
                  <p className="text-xs text-stone-500">Contact: {sup.contactPerson || 'Account Rep'}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#FAF4EC] text-[#6F4E37] flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-[#F5EBDD]">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{sup.email || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{sup.phone || 'N/A'}</span>
                </p>
                <p className="text-[11px] text-stone-500">{sup.address}</p>
              </div>

              <div className="pt-2 border-t border-[#F5EBDD] flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  {sup.items?.length || 0} Products Supplied
                </span>
                <button
                  onClick={() => {
                    setSelectedSupplierId(sup.id);
                    handleAddItemToPO();
                    setPoModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#6F4E37] font-bold text-xs border border-[#DCC8AF]"
                >
                  Order Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {poModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleCreatePO}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">New Purchase Order</h3>
                <p className="text-xs text-stone-500">Order ingredients from supplier</p>
              </div>
              <button
                type="button"
                onClick={() => setPoModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Select Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Lines */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-[#8D674A] uppercase tracking-wider text-[11px]">
                    Ingredients to Order
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemToPO}
                    className="text-xs font-bold text-[#6F4E37] hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EADCC9] space-y-2">
                    <div className="flex justify-between">
                      <select
                        value={item.inventoryItemId}
                        onChange={(e) => {
                          const itId = e.target.value;
                          const found = inventoryItems.find((inv) => inv.id === itId);
                          setPoItems((prev) =>
                            prev.map((pi, pIdx) =>
                              pIdx === idx
                                ? { ...pi, inventoryItemId: itId, unitCost: found?.costPerUnit || 10 }
                                : pi
                            )
                          );
                        }}
                        className="flex-1 p-2 bg-white border border-[#DCC8AF] rounded-lg mr-2 font-medium"
                      >
                        {inventoryItems.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} ({inv.unit})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setPoItems((prev) => prev.filter((_, pIdx) => pIdx !== idx))}
                        className="text-rose-600 font-bold px-2"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-500 font-semibold block">Quantity</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const q = Number(e.target.value);
                            setPoItems((prev) =>
                              prev.map((pi, pIdx) => (pIdx === idx ? { ...pi, quantity: q } : pi))
                            );
                          }}
                          className="w-full p-2 bg-white border border-[#DCC8AF] rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 font-semibold block">Unit Cost (₹)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => {
                            const c = Number(e.target.value);
                            setPoItems((prev) =>
                              prev.map((pi, pIdx) => (pIdx === idx ? { ...pi, unitCost: c } : pi))
                            );
                          }}
                          className="w-full p-2 bg-white border border-[#DCC8AF] rounded-lg font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Notes / Delivery Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Deliver before 8 AM loading dock"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F5EBDD]">
              <button
                type="button"
                onClick={() => setPoModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Creating...' : 'Submit Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
