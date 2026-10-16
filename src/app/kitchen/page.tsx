'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  Sandwich,
  Croissant,
  RefreshCw,
  Bell,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatTime, formatElapsedMinutes } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function KitchenDisplayPage() {
  const { showToast, refreshStats } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stationFilter, setStationFilter] = useState<string>('ALL'); // ALL, BARISTA, KITCHEN, BAKERY

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders?limit=40');
      if (res.ok) {
        const data = await res.json();
        // Kitchen displays active tickets: PLACED, ACCEPTED, PREPARING, READY
        const active = (data.orders || []).filter((o: any) =>
          ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
        );
        setOrders(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s polling for real-time kitchen updates
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast({
          title: `Order Updated to ${newStatus}`,
          type: 'success',
        });
        fetchOrders();
        refreshStats();
      }
    } catch {
      showToast({ title: 'Failed to update order status', type: 'error' });
    }
  };

  // Filter orders by station
  const filteredOrders = orders.filter((order) => {
    if (stationFilter === 'ALL') return true;
    return order.items?.some((it: any) => it.prepStation === stationFilter);
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* KDS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#241710] text-[#F5EBDD] p-5 rounded-3xl shadow-elevated">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-heading">
              Kitchen Display System (KDS)
            </h2>
            <p className="text-xs text-[#DCC8AF]">
              Live order tickets • Real-time preparation queue & station routing
            </p>
          </div>
        </div>

        {/* Station Filters & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#3B261B] p-1 rounded-xl border border-[#4A3023]">
            {[
              { id: 'ALL', name: 'All Stations' },
              { id: 'BARISTA', name: 'Coffee Bar', icon: Coffee },
              { id: 'KITCHEN', name: 'Kitchen', icon: Sandwich },
              { id: 'BAKERY', name: 'Bakery', icon: Croissant },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStationFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  stationFilter === st.id
                    ? 'bg-[#C68B59] text-white shadow-xs'
                    : 'text-[#DCC8AF] hover:text-white'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-[#3B261B] text-[#DCC8AF] hover:text-white transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EADCC9] space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#2C211B]">No Pending Orders</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            All kitchen and barista tickets are currently fulfilled. New POS orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const elapsed = formatElapsedMinutes(order.createdAt);
            const isDelayed = elapsed >= 10;
            const isWarning = elapsed >= 5 && elapsed < 10;

            return (
              <div
                key={order.id}
                className={`rounded-2xl border-2 flex flex-col justify-between shadow-subtle overflow-hidden transition-all ${
                  order.status === 'READY'
                    ? 'border-blue-400 bg-blue-50/30'
                    : isDelayed
                    ? 'border-rose-400 bg-rose-50/40'
                    : isWarning
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-[#EADCC9] bg-white'
                }`}
              >
                {/* Ticket Header */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between text-xs font-bold ${
                    isDelayed
                      ? 'bg-rose-100 text-rose-900 border-rose-200'
                      : isWarning
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : order.status === 'READY'
                      ? 'bg-blue-100 text-blue-900 border-blue-200'
                      : 'bg-[#FAF4EC] text-[#3B261B] border-[#EADCC9]'
                  }`}
                >
                  <div>
                    <span className="text-base tracking-tight font-extrabold">{order.orderNumber}</span>
                    <span className="text-[10px] ml-2 font-normal text-stone-600">
                      {formatTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed}m ago</span>
                  </div>
                </div>

                {/* Ticket Meta (Table / Customer) */}
                <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-200/60 flex items-center justify-between text-[11px] font-semibold text-stone-700">
                  <span>
                    {order.orderType === 'DINE_IN'
                      ? `Table: ${order.table?.tableNumber || 'Main Bar'}`
                      : order.orderType}
                  </span>
                  <span className="text-stone-500 font-normal">
                    {order.customer?.name ? order.customer.name.split(' ')[0] : 'Guest'}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-60 text-xs">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="border-b border-[#F5EBDD] pb-2 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between font-bold text-[#2C211B]">
                        <span>
                          <span className="text-[#C68B59] font-extrabold mr-1.5">{item.quantity}x</span>
                          {item.productName}
                        </span>
                        {item.variantName && (
                          <span className="text-[10px] bg-[#FAF4EC] text-[#6F4E37] px-1.5 py-0.5 rounded border border-[#EADCC9]">
                            {item.variantName}
                          </span>
                        )}
                      </div>

                      {/* Modifiers */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.modifiers.map((m: any, mIdx: number) => (
                            <span
                              key={mIdx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FAF4EC] text-[#6F4E37] border border-[#DCC8AF]"
                            >
                              • {m.modifierOptionName}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Prep Notes */}
                      {item.notes && (
                        <p className="mt-1 text-[10px] text-amber-900 font-semibold bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Order-level special instructions */}
                  {order.notes && (
                    <p className="text-[10px] bg-yellow-50 text-yellow-900 p-2 rounded-lg border border-yellow-200 italic">
                      Special Order Note: &quot;{order.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Ticket Action Footer */}
                <div className="p-3 bg-[#FAF6F0] border-t border-[#EADCC9] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                    <span>Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        order.status === 'READY'
                          ? 'bg-blue-200 text-blue-900'
                          : order.status === 'PREPARING'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Advance State Buttons */}
                  <div className="flex gap-1.5">
                    {order.status === 'PLACED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Start Preparing
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete & Serve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
