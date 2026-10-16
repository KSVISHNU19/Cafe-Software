'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Grid3X3,
  Calendar,
  Clock,
  User,
  Users2,
  CheckCircle2,
  Sparkles,
  Plus,
  RefreshCw,
  X,
  CreditCard,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { formatTime, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function TablesPage() {
  const { showToast } = useApp();
  const [tables, setTables] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'FLOOR' | 'RESERVATIONS'>('FLOOR');
  const [loading, setLoading] = useState(true);

  // New Reservation Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [reservationTime, setReservationTime] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
        setReservations(data.reservations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Update Table Status (e.g. mark cleaned)
  const handleUpdateStatus = async (tableId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, status: newStatus }),
      });

      if (res.ok) {
        showToast({ title: `Table status updated to ${newStatus}`, type: 'success' });
        fetchTables();
      }
    } catch {
      showToast({ title: 'Failed to update table', type: 'error' });
    }
  };

  // Create Reservation
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !reservationTime) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          partySize: Number(partySize),
          reservationTime,
          tableId: selectedTableId || null,
          notes,
        }),
      });

      if (res.ok) {
        showToast({ title: `Reservation confirmed for ${customerName}`, type: 'success' });
        setBookingModalOpen(false);
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        fetchTables();
      } else {
        const err = await res.json();
        showToast({ title: 'Booking error', message: err.error, type: 'error' });
      }
    } catch {
      showToast({ title: 'Failed to create reservation', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group tables by section
  const sections = Array.from(new Set(tables.map((t) => t.section || 'Main Hall')));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EADCC9] shadow-subtle">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#DCC8AF]">
            <button
              onClick={() => setActiveTab('FLOOR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'FLOOR' ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Floor Plan
            </button>
            <button
              onClick={() => setActiveTab('RESERVATIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'RESERVATIONS' ? 'bg-[#3B261B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Bookings ({reservations.length})
            </button>
          </div>

          <button
            onClick={() => setBookingModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C68B59] hover:bg-[#b57a48] text-white font-bold text-xs shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Table</span>
          </button>
        </div>
      </div>

      {/* FLOOR PLAN VIEW */}
      {activeTab === 'FLOOR' && (
        <div className="space-y-6">
          {/* Status Legends */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 bg-white rounded-2xl border border-[#EADCC9] text-xs">
            <span className="font-bold text-[#8D674A] uppercase tracking-wider text-[11px] mr-2">
              Status Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-stone-700 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-stone-700 font-medium">Occupied (Seated)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-stone-700 font-medium">Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-stone-700 font-medium">Needs Cleaning</span>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => {
            const sectionTables = tables.filter((t) => (t.section || 'Main Hall') === section);

            return (
              <div key={section} className="bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-[#F5EBDD] pb-3">
                  <h3 className="font-bold text-base text-[#3B261B]">{section}</h3>
                  <span className="text-xs text-stone-500 font-medium">
                    {sectionTables.length} Tables
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sectionTables.map((tbl) => {
                    const isAvailable = tbl.status === 'AVAILABLE';
                    const isOccupied = tbl.status === 'OCCUPIED';
                    const isReserved = tbl.status === 'RESERVED';
                    const needsCleaning = tbl.status === 'NEEDS_CLEANING';

                    return (
                      <div
                        key={tbl.id}
                        className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                          isAvailable
                            ? 'border-emerald-300 bg-emerald-50/20'
                            : isOccupied
                            ? 'border-amber-300 bg-amber-50/30'
                            : isReserved
                            ? 'border-indigo-300 bg-indigo-50/30'
                            : 'border-rose-300 bg-rose-50/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-base text-[#2C211B]">
                              {tbl.tableNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isOccupied
                                  ? 'bg-amber-100 text-amber-800'
                                  : isReserved
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {tbl.status}
                            </span>
                          </div>

                          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 font-medium">
                            <Users2 className="w-3.5 h-3.5" />
                            <span>Capacity: {tbl.capacity} Guests</span>
                          </p>

                          {/* Occupied active order preview */}
                          {isOccupied && tbl.orders && tbl.orders.length > 0 && (
                            <div className="mt-2 p-2 bg-white/90 rounded-xl border border-amber-200 text-[11px] space-y-1">
                              <p className="font-bold text-amber-900">
                                Order {tbl.orders[0].orderNumber}
                              </p>
                              <p className="text-stone-500">
                                {tbl.orders[0].items?.length || 0} items in progress
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-2">
                          {isAvailable && (
                            <Link
                              href="/pos"
                              className="flex-1 py-1.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs text-center shadow-xs"
                            >
                              Start POS Order
                            </Link>
                          )}

                          {needsCleaning && (
                            <button
                              onClick={() => handleUpdateStatus(tbl.id, 'AVAILABLE')}
                              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                            >
                              Mark Cleaned
                            </button>
                          )}

                          {isOccupied && (
                            <button
                              onClick={() => handleUpdateStatus(tbl.id, 'NEEDS_CLEANING')}
                              className="flex-1 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-800 text-white font-bold text-xs"
                            >
                              Release Table
                            </button>
                          )}

                          {isReserved && (
                            <button
                              onClick={() => handleUpdateStatus(tbl.id, 'OCCUPIED')}
                              className="flex-1 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                            >
                              Seat Guests
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESERVATIONS TAB VIEW */}
      {activeTab === 'RESERVATIONS' && (
        <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5EBDD] pb-3">
            <h3 className="font-bold text-base text-[#3B261B]">Upcoming Bookings</h3>
            <span className="text-xs text-stone-500 font-medium">
              Sorted chronologically
            </span>
          </div>

          <div className="divide-y divide-[#F5EBDD]">
            {reservations.length === 0 ? (
              <p className="py-8 text-center text-xs text-stone-400">
                No active reservations scheduled.
              </p>
            ) : (
              reservations.map((res) => (
                <div key={res.id} className="py-4 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2C211B]">{res.customerName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {res.status}
                      </span>
                    </div>
                    <p className="text-stone-500 flex items-center gap-3">
                      <span>Party: {res.partySize} Guests</span>
                      <span>•</span>
                      <span>Phone: {res.customerPhone || 'N/A'}</span>
                      {res.table && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-[#6F4E37]">
                            Assigned Table: {res.table.tableNumber}
                          </span>
                        </>
                      )}
                    </p>
                    {res.notes && (
                      <p className="text-[11px] text-amber-800 italic">
                        &quot;{res.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[#3B261B] text-sm">
                      {formatTime(res.reservationTime)}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {formatDateTime(res.reservationTime)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* NEW RESERVATION MODAL */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateReservation}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EADCC9] p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#F5EBDD] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#3B261B]">New Table Reservation</h3>
                <p className="text-xs text-stone-500">Record customer booking details</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#8D674A] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 234-5678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#8D674A] block mb-1">Party Size</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Assign Table (Optional)</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                >
                  <option value="">Auto-assign on arrival</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} ({t.section} • {t.capacity}p) - {t.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#8D674A] block mb-1">Special Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Birthday celebration, highchair needed"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#DCC8AF] rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F5EBDD]">
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Confirming...' : 'Save Reservation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
