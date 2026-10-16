'use client';

import React, { useState, useEffect } from 'react';
import {
  Users2,
  Plus,
  Search,
  Sparkles,
  Award,
  Phone,
  Mail,
  ShoppingBag,
  Tag,
  Gift,
  X,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function CustomersPage() {
  const { showToast } = useApp();
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'COUPONS'>('CUSTOMERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Customer Modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Drawer
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, notes }),
      });

      if (res.ok) {
        showToast({
          title: `Customer ${name} Created`,
          message: '50 Welcome Loyalty Points awarded!',
          type: 'success',
        });
        setCustomerModalOpen(false);
        setName('');
        setPhone('');
        setEmail('');
        setNotes('');
        fetchCustomers();
      } else {
        const err = await res.json();
        showToast({ title: 'Error adding customer', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Failed to create customer', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-[#2C211B] font-heading">
            Customers & Loyalty Rewards
          </h2>
          <p className="text-xs text-stone-500">
            Guest directory, automated point accrual, coupon redemption, and lifetime spend history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#DCC8AF]">
            <button
              onClick={() => setActiveTab('CUSTOMERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'CUSTOMERS' ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Customer Directory ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('COUPONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'COUPONS' ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Coupons & Promos ({coupons.length})
            </button>
          </div>

          <button
            onClick={() => setCustomerModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C68B59] hover:bg-[#b57a48] text-white font-bold text-xs shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CUSTOMER DIRECTORY */}
      {activeTab === 'CUSTOMERS' && (
        <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-[#F5EBDD] flex items-center justify-between bg-[#FAF6F0]">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DCC8AF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
              />
            </div>
            <button
              onClick={fetchCustomers}
              className="p-1.5 rounded-xl text-[#6F4E37] hover:bg-[#F5EBDD] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] border-b border-[#EADCC9] text-[#8D674A]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Customer Name</th>
                  <th className="py-3.5 px-4 font-bold">Phone</th>
                  <th className="py-3.5 px-4 font-bold">Email</th>
                  <th className="py-3.5 px-4 font-bold">Loyalty Balance</th>
                  <th className="py-3.5 px-4 font-bold">Total Spent</th>
                  <th className="py-3.5 px-4 font-bold">Visits</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBDD] font-medium">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF4EC]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#2C211B]">{c.name}</td>
                    <td className="py-3.5 px-4 text-stone-600">{c.phone || '-'}</td>
                    <td className="py-3.5 px-4 text-stone-600">{c.email || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {c.loyaltyPoints} Points
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#3B261B]">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">{c.visitCount} visits</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#6F4E37] font-bold text-[11px] border border-[#DCC8AF]"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COUPONS & PROMOS */}
      {activeTab === 'COUPONS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((cp) => (
            <div
              key={cp.id}
              className="bg-white rounded-3xl border border-[#EADCC9] p-5 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-xl bg-[#3B261B] text-white font-mono font-bold text-xs tracking-wider">
                    {cp.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#2C211B]">
                  {cp.discountType === 'PERCENTAGE'
                    ? `${cp.discountValue}% Off Entire Order`
                    : `${formatCurrency(cp.discountValue)} Off Order`}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Min order: {formatCurrency(cp.minOrderValue)}
                  {cp.maxDiscount ? ` • Max cap: ${formatCurrency(cp.maxDiscount)}` : ''}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F5EBDD] text-[11px] text-stone-400 mt-3 flex justify-between">
                <span>Used {cp.timesUsed || 0} times</span>
                <span className="font-semibold text-[#6F4E37]">Ready at POS</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOMER PROFILE DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#3B261B]">{selectedCustomer.name}</h3>
                <p className="text-xs text-stone-500">{selectedCustomer.phone || selectedCustomer.email}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#FAF6F0] p-4 rounded-2xl text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Balance</span>
                <span className="text-base font-extrabold text-amber-700">
                  {selectedCustomer.loyaltyPoints} pts
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Spent</span>
                <span className="text-base font-extrabold text-[#3B261B]">
                  {formatCurrency(selectedCustomer.totalSpent)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Visits</span>
                <span className="text-base font-extrabold text-stone-800">
                  {selectedCustomer.visitCount}
                </span>
              </div>
            </div>

            {/* Points Ledger */}
            <div>
              <h4 className="font-bold text-xs text-[#8D674A] uppercase tracking-wider mb-2">
                Loyalty Point History
              </h4>
              <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto">
                {selectedCustomer.transactions?.map((t: any) => (
                  <div key={t.id} className="p-2 bg-stone-50 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-stone-800">{t.reason || t.type}</p>
                      <p className="text-[10px] text-stone-400">{formatDateTime(t.createdAt)}</p>
                    </div>
                    <span
                      className={`font-bold ${
                        t.points > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {t.points > 0 ? `+${t.points}` : t.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateCustomer}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">Add Customer Account</h3>
                <p className="text-xs text-stone-500">Sign up customer for loyalty rewards</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-1122"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Special Preferences / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Likes extra hot oat flat white"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F5EBDD]">
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Saving...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
