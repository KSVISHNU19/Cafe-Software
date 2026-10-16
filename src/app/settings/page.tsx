'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Printer,
  Coffee,
  CheckCircle2,
  IndianRupee,
  Percent,
  MapPin,
  Phone,
  FileText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { showToast } = useApp();
  const [cafe, setCafe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [taxRatePercent, setTaxRatePercent] = useState('8.5');
  const [receiptHeader, setReceiptHeader] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const c = data.cafe;
        if (c) {
          setCafe(c);
          setName(c.name || '');
          setTagline(c.tagline || '');
          setAddress(c.address || '');
          setPhone(c.phone || '');
          setCurrency(c.currency || '₹');
          setTaxRatePercent(c.taxRatePercent?.toString() || '8.5');
          setReceiptHeader(c.receiptHeader || '');
          setReceiptFooter(c.receiptFooter || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tagline,
          address,
          phone,
          currency,
          taxRatePercent: Number(taxRatePercent),
          receiptHeader,
          receiptFooter,
        }),
      });

      if (res.ok) {
        showToast({ title: 'Cafe Settings & Receipt Updated', type: 'success' });
        fetchSettings();
      } else {
        const err = await res.json();
        showToast({ title: 'Failed to save settings', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Save error', type: 'error' });
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
            Cafe & Receipt Settings
          </h2>
          <p className="text-xs text-stone-500">
            Configure jurisdiction taxes, store address, contact details, and thermal receipt branding.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5"
        >
          <Save className="w-4 h-4 text-[#C68B59]" />
          <span>{isSubmitting ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Settings Form */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-6">
          {/* Cafe Profile */}
          <div className="bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle space-y-4">
            <h3 className="font-bold text-base text-[#3B261B] border-b border-[#F5EBDD] pb-3">
              Store Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Cafe Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Store Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tax & Currency */}
          <div className="bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle space-y-4">
            <h3 className="font-bold text-base text-[#3B261B] border-b border-[#F5EBDD] pb-3">
              Taxation & Currency Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Default Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Thermal Receipt Header & Footer */}
          <div className="bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle space-y-4">
            <h3 className="font-bold text-base text-[#3B261B] border-b border-[#F5EBDD] pb-3">
              Receipt Header & Footer Content
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">
                  Receipt Header Note
                </label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">
                  Receipt Footer (Wi-Fi, Return Policy, Social Handles)
                </label>
                <textarea
                  rows={3}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Right Col: Live Thermal Receipt Preview */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#EADCC9] shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-[#F5EBDD] pb-2">
              <span className="font-bold text-xs text-[#8D674A] uppercase tracking-wider">
                Live 80mm Receipt Preview
              </span>
              <Printer className="w-4 h-4 text-stone-400" />
            </div>

            {/* Paper Receipt Simulation */}
            <div className="p-4 bg-[#FFFDF8] border border-dashed border-stone-300 rounded-2xl font-mono text-[11px] text-stone-800 space-y-2 shadow-xs">
              <div className="text-center border-b pb-2">
                <h4 className="font-bold text-xs uppercase">{name || 'Cafe Artisan Roasters'}</h4>
                <p className="text-[10px] text-stone-500">{tagline || 'Specialty Coffee & Kitchen'}</p>
                <p className="text-[10px] text-stone-500">{address || '142 Espresso Blvd'}</p>
                <p className="text-[10px] text-stone-500">Tel: {phone || '+1 (555) 382-7400'}</p>
                {receiptHeader && (
                  <p className="text-[10px] font-semibold text-[#6F4E37] mt-1">{receiptHeader}</p>
                )}
              </div>

              <div className="flex justify-between text-[10px] pt-1 border-b pb-1">
                <span>ORDER: BD-1048</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-[10px] font-bold">TYPE: DINE-IN • Table T-02</p>

              <div className="space-y-1 py-1 border-b">
                <div className="flex justify-between">
                  <span>1x Velvet Vanilla Latte (16oz)</span>
                  <span>{currency}240.00</span>
                </div>
                <p className="text-[9px] text-stone-500 pl-2">+ Oat Milk ({currency}50.00)</p>
                <div className="flex justify-between">
                  <span>2x Butter Almond Croissant</span>
                  <span>{currency}360.00</span>
                </div>
              </div>

              <div className="space-y-0.5 pt-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{currency}650.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRatePercent}%):</span>
                  <span>{currency}55.25</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t">
                  <span>TOTAL:</span>
                  <span>{currency}705.25</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[9px] text-stone-500 border-t whitespace-pre-line">
                {receiptFooter || 'Wi-Fi: CafeGuest\nThank you for choosing artisan coffee!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
