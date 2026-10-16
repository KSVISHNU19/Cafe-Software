'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  IndianRupee,
  TrendingDown,
  RefreshCw,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function ExpensesPage() {
  const { showToast, currentUser } = useApp();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [byCategory, setByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Coffee Beans & Supplies');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        setTotalExpenses(data.totalExpenses || 0);
        setByCategory(data.byCategory || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          description,
          approvedBy: currentUser.name,
        }),
      });

      if (res.ok) {
        showToast({ title: 'Expense Logged Successfully', type: 'success' });
        setModalOpen(false);
        setAmount('');
        setDescription('');
        fetchExpenses();
      } else {
        const err = await res.json();
        showToast({ title: 'Failed to save expense', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Submission error', type: 'error' });
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
            Operating Expenses & Overhead
          </h2>
          <p className="text-xs text-stone-500">
            Log raw ingredients shipments, utilities, wages, barista equipment upkeep, and marketing.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-[#C68B59]" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle">
          <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider">
            Total Overhead Logged
          </span>
          <h3 className="text-2xl font-bold text-rose-700 mt-2">
            {formatCurrency(totalExpenses)}
          </h3>
          <p className="text-xs text-stone-500 mt-1">{expenses.length} Approved Vouchers</p>
        </div>

        {Object.entries(byCategory)
          .slice(0, 3)
          .map(([cat, amt]) => (
            <div key={cat} className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle">
              <span className="text-xs font-semibold text-[#8D674A] uppercase tracking-wider truncate block">
                {cat}
              </span>
              <h3 className="text-2xl font-bold text-[#2C211B] mt-2">{formatCurrency(amt)}</h3>
              <p className="text-xs text-stone-400 mt-1">
                {(((amt as number) / (totalExpenses || 1)) * 100).toFixed(0)}% of total expenses
              </p>
            </div>
          ))}
      </div>

      {/* EXPENSES LIST */}
      <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-[#F5EBDD] flex items-center justify-between bg-[#FAF6F0]">
          <h3 className="font-bold text-sm text-[#3B261B]">Expense Ledger</h3>
          <button
            onClick={fetchExpenses}
            className="p-1.5 rounded-xl text-[#6F4E37] hover:bg-[#F5EBDD] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] border-b border-[#EADCC9] text-[#8D674A]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Description</th>
                <th className="py-3.5 px-4 font-bold">Date</th>
                <th className="py-3.5 px-4 font-bold">Approved By</th>
                <th className="py-3.5 px-4 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EBDD] font-medium">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#FAF4EC]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#3B261B] bg-[#FAF4EC] px-2.5 py-0.5 rounded-lg border border-[#DCC8AF]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-800">{exp.description}</td>
                  <td className="py-3.5 px-4 text-stone-500">{formatDate(exp.date)}</td>
                  <td className="py-3.5 px-4 text-stone-600">{exp.approvedBy || 'Owner'}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-700 text-right">
                    {formatCurrency(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">Record Operating Expense</h3>
                <p className="text-xs text-stone-500">Log cafe operating cost</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                >
                  <option value="Coffee Beans & Supplies">Coffee Beans & Roastery Supplies</option>
                  <option value="Dairy & Milks">Dairy & Plant Milks</option>
                  <option value="Packaging & Cups">Biodegradable Packaging & Cups</option>
                  <option value="Utilities">Electricity, Gas & Water Filtration</option>
                  <option value="Equipment Maintenance">Espresso Machine & Grinder Maintenance</option>
                  <option value="Wages & Payroll">Staff Wages & Shift Bonuses</option>
                  <option value="Rent">Cafe Space Lease</option>
                  <option value="Marketing">Social & Local Marketing</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Description / Memo *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly roaster bean shipment payment"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F5EBDD]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Saving...' : 'Record Expense'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
