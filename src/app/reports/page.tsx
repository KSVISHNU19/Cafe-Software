'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  IndianRupee,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  PieChart,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function ReportsPage() {
  const { showToast } = useApp();
  const [range, setRange] = useState('all'); // today, 7d, 30d, all
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?range=${range}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  // Export CSV functionality
  const handleExportCSV = () => {
    if (!data?.topProducts) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Product Name,Category,Quantity Sold,Total Revenue (₹)\n';

    data.topProducts.forEach((p: any) => {
      csvContent += `"${p.name}","${p.category}",${p.quantity},${p.revenue.toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cafe_Sales_Report_${range}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({ title: 'Sales Report CSV Downloaded', type: 'success' });
  };

  const summary = data?.summary || {
    grossSales: 0,
    totalDiscount: 0,
    totalTax: 0,
    netSales: 0,
    totalCOGS: 0,
    estimatedGrossProfit: 0,
    totalOperatingExpenses: 0,
    estimatedOperatingResult: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-[#2C211B] font-heading">
            Financial Reports & Business Intelligence
          </h2>
          <p className="text-xs text-stone-500">
            Server-side financial aggregation, gross margins, COGS, operating results, and CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range Pills */}
          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#DCC8AF]">
            {[
              { id: 'today', name: 'Today' },
              { id: '7d', name: '7 Days' },
              { id: '30d', name: '30 Days' },
              { id: 'all', name: 'All Time' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  range === r.id ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C68B59] hover:bg-[#b57a48] text-white font-bold text-xs shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FINANCIAL STATEMENT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle">
          <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">
            Gross Sales
          </span>
          <h3 className="text-2xl font-bold text-[#2C211B] mt-2">
            {formatCurrency(summary.grossSales)}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Discounts: -{formatCurrency(summary.totalDiscount)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle">
          <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">
            Net Revenue
          </span>
          <h3 className="text-2xl font-bold text-[#3B261B] mt-2">
            {formatCurrency(summary.netSales)}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Tax Collected: {formatCurrency(summary.totalTax)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle">
          <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">
            Est. Gross Margin
          </span>
          <h3 className="text-2xl font-bold text-emerald-700 mt-2">
            {formatCurrency(summary.estimatedGrossProfit)}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Ingredient COGS: {formatCurrency(summary.totalCOGS)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle">
          <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">
            Operating Result
          </span>
          <h3
            className={`text-2xl font-bold mt-2 ${
              summary.estimatedOperatingResult >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(summary.estimatedOperatingResult)}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Overhead Expenses: {formatCurrency(summary.totalOperatingExpenses)}
          </p>
        </div>
      </div>

      {/* TWO COLUMNS: Payment & Category breakdowns + Product Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Payment Method & Channel breakdowns */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle space-y-3">
            <h4 className="font-bold text-sm text-[#3B261B]">Payment Method Breakdown</h4>
            <div className="space-y-2">
              {data?.paymentMethods &&
                Object.entries(data.paymentMethods).map(([method, amount]: [string, any]) => (
                  <div key={method} className="p-3 bg-[#FAF6F0] rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800">
                      {method === 'CASH' ? 'Cash Tender' : method === 'CARD' ? 'Credit / Debit Card' : method}
                    </span>
                    <span className="font-bold text-[#3B261B]">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Order Channel */}
          <div className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle space-y-3">
            <h4 className="font-bold text-sm text-[#3B261B]">Order Types Distribution</h4>
            <div className="space-y-2">
              {data?.orderTypes &&
                Object.entries(data.orderTypes).map(([channel, count]: [string, any]) => (
                  <div key={channel} className="p-3 bg-[#FAF6F0] rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800">{channel}</span>
                    <span className="font-bold text-[#6F4E37]">{count} Orders</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Product Performance Ranking */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EADCC9] shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5EBDD] pb-3">
            <div>
              <h3 className="font-bold text-base text-[#3B261B]">Menu Item Sales Ranking</h3>
              <p className="text-xs text-stone-500">Volume and revenue contributions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] border-b border-[#EADCC9] text-[#8D674A]">
                <tr>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Units Sold</th>
                  <th className="py-3 px-4 font-bold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBDD] font-medium">
                {data?.topProducts && data.topProducts.length > 0 ? (
                  data.topProducts.map((p: any, idx: number) => (
                    <tr key={p.name} className="hover:bg-[#FAF4EC]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#2C211B] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#FAF4EC] text-[#6F4E37] flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{p.category}</td>
                      <td className="py-3 px-4 font-bold text-stone-800">{p.quantity}</td>
                      <td className="py-3 px-4 font-bold text-[#3B261B] text-right">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-400">
                      No product sales in selected time frame.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
