'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Clock,
  PlusCircle,
  CreditCard,
  UtensilsCrossed,
  Boxes,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatTime, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [activeKitchenOrders, setActiveKitchenOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [repRes, ordRes, invRes] = await Promise.all([
          fetch('/api/reports?range=all'),
          fetch('/api/orders?limit=6'),
          fetch('/api/inventory'),
        ]);

        if (repRes.ok) {
          const r = await repRes.json();
          setReportData(r);
        }

        if (ordRes.ok) {
          const o = await ordRes.json();
          setRecentOrders(o.orders || []);
          const kitchen = (o.orders || []).filter((item: any) =>
            ['PLACED', 'ACCEPTED', 'PREPARING'].includes(item.status)
          );
          setActiveKitchenOrders(kitchen);
        }

        if (invRes.ok) {
          const i = await invRes.json();
          setLowStockItems(i.lowStockItems || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const summary = reportData?.summary || {
    netSales: 69.97,
    grossSales: 66.65,
    totalOrders: 3,
    averageOrderValue: 23.32,
    estimatedGrossProfit: 58.42,
    totalCOGS: 11.55,
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#3B261B] via-[#4A3023] to-[#6F4E37] text-white p-6 rounded-3xl shadow-elevated">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C68B59]/30 text-[#F5EBDD] border border-[#C68B59]/40">
              Live Operations
            </span>
            <span className="text-xs text-[#DCC8AF]">Welcome back, {currentUser.name}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-heading">
            Cafe Executive Dashboard
          </h2>
          <p className="text-xs text-[#DCC8AF] max-w-xl">
            Real-time sales tracking, active kitchen tickets, table occupancy, and inventory health for your cafe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/pos"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C68B59] hover:bg-[#b57a48] text-white font-semibold text-xs shadow-md transition-transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New POS Order</span>
          </Link>
          <Link
            href="/kitchen"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFFDF8] font-medium text-xs backdrop-blur-xs border border-white/10 transition-colors"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Kitchen Display ({activeKitchenOrders.length})</span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFFDF8] font-medium text-xs backdrop-blur-xs border border-white/10 transition-colors"
          >
            <FileText className="w-4 h-4 text-[#DCC8AF]" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#EADCC9] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">Gross Sales</span>
            <div className="w-9 h-9 rounded-xl bg-[#F5EBDD] flex items-center justify-center text-[#6F4E37]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-[#2C211B]">{formatCurrency(summary.grossSales)}</h3>
            <p className="text-xs text-emerald-700 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Net: {formatCurrency(summary.netSales)}</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#EADCC9] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-[#F5EBDD] flex items-center justify-center text-[#6F4E37]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-[#2C211B]">{summary.totalOrders} Completed</h3>
            <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
              <span>Avg Ticket:</span>
              <span className="font-semibold text-stone-700">{formatCurrency(summary.averageOrderValue)}</span>
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#EADCC9] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">Est. Gross Profit</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-emerald-700">{formatCurrency(summary.estimatedGrossProfit)}</h3>
            <p className="text-xs text-stone-500 mt-1">
              COGS: {formatCurrency(summary.totalCOGS)}
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-[#EADCC9] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">Active Operations</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-[#2C211B]">{activeKitchenOrders.length} in Kitchen</h3>
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowStockItems.length} ingredients low stock</span>
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: Sales Chart / Category Breakdown + Live Kitchen Rush */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales Performance & Popular Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales by Category & Top Sellers Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EADCC9] shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-[#2C211B] text-base">Top Performing Menu Items</h4>
                <p className="text-xs text-stone-500">Ranked by revenue contribution</p>
              </div>
              <Link
                href="/menu"
                className="text-xs font-semibold text-[#6F4E37] hover:text-[#3B261B] flex items-center gap-1"
              >
                <span>View Full Menu</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {reportData?.topProducts && reportData.topProducts.length > 0 ? (
              <div className="space-y-3">
                {reportData.topProducts.slice(0, 4).map((p: any, idx: number) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6F0] border border-[#EADCC9]/60 hover:border-[#C68B59] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#3B261B] text-white flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2C211B]">{p.name}</p>
                        <p className="text-xs text-stone-500">{p.quantity} units ordered</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#3B261B]">{formatCurrency(p.revenue)}</p>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-stone-400">Loading top product sales...</div>
            )}

            {/* Category Breakdown Progress */}
            {reportData?.categorySales && (
              <div className="mt-6 pt-5 border-t border-[#F5EBDD] space-y-3">
                <p className="text-xs font-bold text-[#8D674A] uppercase tracking-wider">Revenue by Category</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(reportData.categorySales).map(([cat, rev]: [string, any]) => (
                    <div key={cat} className="p-3 bg-white border border-[#EADCC9] rounded-xl">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-stone-800">{cat}</span>
                        <span className="font-bold text-[#6F4E37]">{formatCurrency(rev)}</span>
                      </div>
                      <div className="w-full bg-[#F5EBDD] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#C68B59] h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(15, (rev / (summary.grossSales || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Orders List */}
          <div className="bg-white p-6 rounded-2xl border border-[#EADCC9] shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-[#2C211B] text-base">Recent Transactions</h4>
                <p className="text-xs text-stone-500">Live order audit feed</p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-[#6F4E37] hover:text-[#3B261B] flex items-center gap-1"
              >
                <span>All Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F5EBDD] text-stone-500">
                    <th className="py-2.5 font-semibold">Order #</th>
                    <th className="py-2.5 font-semibold">Type / Table</th>
                    <th className="py-2.5 font-semibold">Customer</th>
                    <th className="py-2.5 font-semibold">Items</th>
                    <th className="py-2.5 font-semibold">Total</th>
                    <th className="py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EBDD]/60 font-medium">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF4EC]/60 transition-colors">
                      <td className="py-3 font-bold text-[#3B261B]">{ord.orderNumber}</td>
                      <td className="py-3 text-stone-700">
                        {ord.orderType === 'DINE_IN'
                          ? `Dine-In (${ord.table?.tableNumber || 'Bar'})`
                          : ord.orderType}
                      </td>
                      <td className="py-3 text-stone-600">{ord.customer?.name || 'Walk-in Guest'}</td>
                      <td className="py-3 text-stone-600">{ord.items?.length || 0} items</td>
                      <td className="py-3 font-bold text-[#2C211B]">{formatCurrency(ord.total)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            ord.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'PREPARING'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'READY'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Kitchen Queue + Low Stock Alerts */}
        <div className="space-y-6">
          {/* Active Kitchen Queue Widget */}
          <div className="bg-white p-5 rounded-2xl border border-[#EADCC9] shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-[#2C211B] text-sm">Kitchen Queue</h4>
              </div>
              <Link href="/kitchen" className="text-xs text-[#6F4E37] font-semibold hover:underline">
                Open KDS →
              </Link>
            </div>

            {activeKitchenOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 bg-[#FAF6F0] rounded-xl border border-dashed border-[#EADCC9]">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                Kitchen queue is clear!
              </div>
            ) : (
              <div className="space-y-3">
                {activeKitchenOrders.map((ko) => (
                  <div
                    key={ko.id}
                    className="p-3 rounded-xl bg-[#FFFDF8] border-2 border-amber-300 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#3B261B]">{ko.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {ko.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600">
                      {ko.items?.map((it: any) => (
                        <div key={it.id} className="flex justify-between">
                          <span>
                            {it.quantity}x {it.productName}
                          </span>
                          <span className="text-stone-400">{it.variantName || ''}</span>
                        </div>
                      ))}
                    </div>
                    {ko.notes && (
                      <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded italic">
                        &quot;{ko.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Warning Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#EADCC9] shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-[#2C211B] text-sm">Low Stock Alerts</h4>
              </div>
              <Link href="/inventory" className="text-xs text-[#6F4E37] font-semibold hover:underline">
                Inventory →
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 bg-[#FAF6F0] rounded-xl border border-dashed border-[#EADCC9]">
                All ingredients are sufficiently stocked.
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-rose-950">{inv.name}</p>
                      <p className="text-[11px] text-rose-700">
                        Remaining: <span className="font-bold">{inv.currentStock} {inv.unit}</span> (Min: {inv.reorderLevel})
                      </p>
                    </div>
                    <Link
                      href="/suppliers"
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white text-rose-700 rounded-lg border border-rose-300 shadow-xs hover:bg-rose-100 transition-colors"
                    >
                      Reorder
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-[#FAF4EC] p-5 rounded-2xl border border-[#EADCC9] space-y-2">
            <p className="text-xs font-bold text-[#8D674A] uppercase tracking-wider mb-2">Shortcuts</p>
            <Link
              href="/pos"
              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-stone-800 hover:bg-white transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-[#6F4E37] text-white flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span>Open POS Terminal</span>
            </Link>
            <Link
              href="/staff"
              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-stone-800 hover:bg-white transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-[#6F4E37] text-white flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span>Register Drawer Shift</span>
            </Link>
            <Link
              href="/expenses"
              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-stone-800 hover:bg-white transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-[#6F4E37] text-white flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span>Record Operating Expense</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
