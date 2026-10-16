'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Printer,
  RotateCcw,
  CheckCircle2,
  X,
  CreditCard,
  User,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function OrdersPage() {
  const { showToast, refreshStats, currentUser } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  // Process Refund
  const handleProcessRefund = async () => {
    if (!selectedOrder) return;
    setIsProcessingRefund(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundAmount: refundAmount || selectedOrder.total,
          refundReason: refundReason || 'Customer requested return/dissatisfaction',
          authorizedBy: currentUser.name,
        }),
      });

      if (res.ok) {
        showToast({
          title: `Refund Processed for ${selectedOrder.orderNumber}`,
          message: `Amount: ${formatCurrency(Number(refundAmount || selectedOrder.total))}`,
          type: 'success',
        });
        setRefundModalOpen(false);
        setSelectedOrder(null);
        fetchOrders();
        refreshStats();
      } else {
        const err = await res.json();
        showToast({ title: 'Refund Failed', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Refund Error', type: 'error' });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-[#2C211B] font-heading">
            Order Management & Audit Ledger
          </h2>
          <p className="text-xs text-stone-500">
            Search orders, review itemized line details, process authorized refunds, and track status.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#6F4E37] font-bold text-xs border border-[#DCC8AF] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EADCC9] flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['ALL', 'PLACED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#3B261B] text-white shadow-xs'
                  : 'bg-[#FAF4EC] text-stone-700 hover:bg-[#F5EBDD]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, table, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] border-b border-[#EADCC9] text-[#8D674A]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Order #</th>
                <th className="py-3.5 px-4 font-bold">Date & Time</th>
                <th className="py-3.5 px-4 font-bold">Type / Table</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Items Count</th>
                <th className="py-3.5 px-4 font-bold">Total</th>
                <th className="py-3.5 px-4 font-bold">Payment</th>
                <th className="py-3.5 px-4 font-bold">Kitchen Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EBDD] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    Loading order records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF4EC]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#3B261B]">{ord.orderNumber}</td>
                    <td className="py-3.5 px-4 text-stone-600">{formatDateTime(ord.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-800">
                        {ord.orderType === 'DINE_IN'
                          ? `Dine-In (${ord.table?.tableNumber || 'Bar'})`
                          : ord.orderType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {ord.customer?.name || 'Walk-in Guest'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#2C211B]">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.paymentStatus === 'REFUNDED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ord.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'PREPARING'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'READY'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'CANCELLED'
                            ? 'bg-stone-200 text-stone-600'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#6F4E37] font-bold text-[11px] border border-[#DCC8AF] transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAIL DRAWER / MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#3B261B]">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-stone-500">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF6F0] p-3 rounded-2xl">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Order Type</span>
                <span className="font-bold text-stone-800">
                  {selectedOrder.orderType}{' '}
                  {selectedOrder.table ? `• Table ${selectedOrder.table.tableNumber}` : ''}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Customer</span>
                <span className="font-bold text-stone-800">
                  {selectedOrder.customer?.name || 'Walk-in Guest'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Kitchen Status</span>
                <span className="font-bold text-amber-700">{selectedOrder.status}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Payment Status</span>
                <span className="font-bold text-emerald-700">{selectedOrder.paymentStatus}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[#8D674A] uppercase tracking-wider text-[11px]">
                Ordered Items
              </h4>
              <div className="space-y-2 divide-y divide-[#F5EBDD]">
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} className="pt-2 first:pt-0 flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#2C211B]">
                        {it.quantity}x {it.productName}
                      </p>
                      {it.variantName && (
                        <span className="text-[10px] text-stone-500">Size: {it.variantName}</span>
                      )}
                      {it.modifiers?.map((m: any, mIdx: number) => (
                        <p key={mIdx} className="text-[10px] text-[#6F4E37]">
                          + {m.modifierOptionName} ({formatCurrency(m.price)})
                        </p>
                      ))}
                      {it.notes && (
                        <p className="text-[10px] text-amber-800 italic">Note: {it.notes}</p>
                      )}
                    </div>
                    <span className="font-bold text-[#3B261B]">{formatCurrency(it.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 border-t border-[#F5EBDD] space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Tax</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#3B261B] pt-1 border-t">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Refund History if any */}
            {selectedOrder.refunds && selectedOrder.refunds.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-800">
                <p className="font-bold">Refund Record:</p>
                {selectedOrder.refunds.map((r: any) => (
                  <p key={r.id}>
                    • Refunded {formatCurrency(r.amount)} on {formatDateTime(r.createdAt)} ({r.reason}) by {r.authorizedBy}
                  </p>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#F5EBDD] flex gap-2">
              {selectedOrder.paymentStatus === 'PAID' && (
                <button
                  onClick={() => {
                    setRefundAmount(selectedOrder.total.toString());
                    setRefundModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Issue Refund</span>
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#3B261B] font-bold text-xs border border-[#DCC8AF] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-200 p-6 space-y-4">
            <h3 className="font-bold text-base text-rose-900">
              Process Refund for {selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-stone-500">
              This will update the ledger, adjust payments, and create an audit log under your employee account.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedOrder.total}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Reason for Refund</label>
                <input
                  type="text"
                  placeholder="e.g. Drink remake declined / customer complaint"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRefundModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={isProcessingRefund}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                {isProcessingRefund ? 'Processing...' : 'Authorize Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
