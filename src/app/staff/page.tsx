'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  UserCheck,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  Shield,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function StaffPage() {
  const { showToast, currentUser } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [cashSales, setCashSales] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Close Shift Modal
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Shift Modal
  const [openModalOpen, setOpenModalOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState('2000.00');

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setShifts(data.shifts || []);
        setActiveShift(data.activeShift || null);
        setCashSales(data.currentShiftCashSales || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'OPEN',
          userId: currentUser.id,
          openingCash: Number(openingCash) || 150.0,
          notes: 'Register opened by ' + currentUser.name,
        }),
      });

      if (res.ok) {
        showToast({ title: 'Cash Register Shift Opened', type: 'success' });
        setOpenModalOpen(false);
        fetchStaffData();
      }
    } catch {
      showToast({ title: 'Error opening shift', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE',
          shiftId: activeShift.id,
          actualClosingCash: Number(countedCash) || 0,
          notes: shiftNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const disc = data.shift.discrepancy || 0;
        showToast({
          title: 'Shift Closed & Reconciled',
          message:
            disc === 0
              ? 'Drawer balanced perfectly!'
              : `Discrepancy: ${formatCurrency(disc)}`,
          type: disc === 0 ? 'success' : 'warning',
        });
        setCloseModalOpen(false);
        setCountedCash('');
        setShiftNotes('');
        fetchStaffData();
      }
    } catch {
      showToast({ title: 'Error closing shift', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const expectedClosing = activeShift ? activeShift.openingCash + cashSales : 0;
  const computedDiscrepancy = countedCash ? Number(countedCash) - expectedClosing : 0;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-[#2C211B] font-heading">
            Staff Roster & Cash Register Reconciliation
          </h2>
          <p className="text-xs text-stone-500">
            Manage employee roles, PIN access, shift opening/closing, and drawer audit balance.
          </p>
        </div>

        <button
          onClick={fetchStaffData}
          className="p-2 rounded-xl text-[#6F4E37] hover:bg-[#F5EBDD] transition-colors border border-[#DCC8AF]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* REGISTER SHIFT CARD */}
      <div className="bg-gradient-to-r from-[#3B261B] to-[#6F4E37] text-white p-6 rounded-3xl shadow-elevated flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activeShift ? 'bg-emerald-400 animate-pulse' : 'bg-stone-400'
              }`}
            />
            <span className="text-xs uppercase tracking-wider font-bold text-[#DCC8AF]">
              {activeShift ? 'Register Drawer Open' : 'Register Drawer Closed'}
            </span>
          </div>

          <h3 className="text-2xl font-bold font-heading">
            {activeShift
              ? `Expected In Drawer: ${formatCurrency(expectedClosing)}`
              : 'No Active Cash Drawer Session'}
          </h3>

          {activeShift && (
            <p className="text-xs text-[#F5EBDD]/80">
              Started by {activeShift.user?.name} on {formatDateTime(activeShift.startTime)} •
              Opening Float: {formatCurrency(activeShift.openingCash)} • Cash Sales:{' '}
              {formatCurrency(cashSales)}
            </p>
          )}
        </div>

        <div>
          {activeShift ? (
            <button
              onClick={() => {
                setCountedCash(expectedClosing.toFixed(2));
                setCloseModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-white text-[#3B261B] font-bold text-xs shadow-md hover:bg-[#F5EBDD] transition-transform hover:-translate-y-0.5"
            >
              Close & Reconcile Drawer
            </button>
          ) : (
            <button
              onClick={() => setOpenModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#C68B59] hover:bg-[#b57a48] text-white font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5"
            >
              Open Register Shift
            </button>
          )}
        </div>
      </div>

      {/* TWO COLUMNS: Staff List + Shift History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Employee Accounts */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EADCC9] shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5EBDD] pb-3">
            <div>
              <h3 className="font-bold text-base text-[#3B261B]">Employee Roster</h3>
              <p className="text-xs text-stone-500">Authorized cafe team members and individual PIN codes</p>
            </div>
            <span className="text-xs font-bold text-[#8D674A]">{users.length} Active Accounts</span>
          </div>

          <div className="divide-y divide-[#F5EBDD]">
            {users.map((u) => (
              <div key={u.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      u.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#C68B59]"
                  />
                  <div>
                    <p className="font-bold text-sm text-[#2C211B]">{u.name}</p>
                    <p className="text-stone-500 text-[11px]">{u.email}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF4EC] text-[#6F4E37] border border-[#DCC8AF]">
                      {u.role}
                    </span>
                    <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1 justify-end">
                      <KeyRound className="w-3 h-3" />
                      <span>PIN: {u.pinCode || '****'}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Shift Audit History */}
        <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5EBDD] pb-3">
            <h3 className="font-bold text-base text-[#3B261B]">Shift History</h3>
            <span className="text-xs text-stone-500">Past Registers</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {shifts.map((s) => {
              const isClosed = s.status === 'CLOSED';
              const hasDisc = isClosed && Math.abs(s.discrepancy || 0) > 0.01;

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                    s.status === 'OPEN'
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : hasDisc
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-[#EADCC9] bg-[#FAF6F0]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#3B261B]">{s.user?.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        s.status === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    Opened: {formatDateTime(s.startTime)}
                  </p>

                  <div className="flex justify-between pt-1 border-t border-stone-200/50 text-[11px]">
                    <span>Opening Float:</span>
                    <span className="font-bold">{formatCurrency(s.openingCash)}</span>
                  </div>

                  {isClosed && (
                    <>
                      <div className="flex justify-between text-[11px]">
                        <span>Actual Counted:</span>
                        <span className="font-bold">{formatCurrency(s.actualClosingCash)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>Discrepancy:</span>
                        <span className={hasDisc ? 'text-rose-600' : 'text-emerald-700'}>
                          {formatCurrency(s.discrepancy || 0)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CLOSE REGISTER DRAWER MODAL */}
      {closeModalOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleCloseShift}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">Close Cash Register Shift</h3>
                <p className="text-xs text-stone-500">Reconcile physical cash with system sales</p>
              </div>
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF6F0] rounded-2xl space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Opening Float:</span>
                  <span className="font-bold">{formatCurrency(activeShift.openingCash)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Cash Sales Recorded:</span>
                  <span className="font-bold">{formatCurrency(cashSales)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#3B261B] pt-1 border-t">
                  <span>Expected Drawer Total:</span>
                  <span>{formatCurrency(expectedClosing)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">
                  Physical Cash Counted (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full p-2.5 text-base font-bold text-stone-900 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                />
              </div>

              {/* Live discrepancy readout */}
              <div
                className={`p-3 rounded-xl border flex justify-between items-center font-bold text-xs ${
                  Math.abs(computedDiscrepancy) < 0.01
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span>Calculated Discrepancy:</span>
                <span>{formatCurrency(computedDiscrepancy)}</span>
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Closing Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. End of morning rush, register balanced"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F5EBDD]">
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Closing...' : 'Confirm & Close Shift'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OPEN REGISTER DRAWER MODAL */}
      {openModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleOpenShift}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">Open Register Shift</h3>
                <p className="text-xs text-stone-500">Enter beginning cash drawer float</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">
                  Opening Cash Float (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="w-full p-2.5 text-base font-bold text-stone-900 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F5EBDD]">
              <button
                type="button"
                onClick={() => setOpenModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Opening...' : 'Start Shift'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
