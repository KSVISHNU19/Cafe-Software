'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function NotificationsPage() {
  const { showToast, refreshStats } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      if (res.ok) {
        showToast({ title: 'All Notifications Marked Read', type: 'info' });
        fetchNotifs();
        refreshStats();
      }
    } catch {
      showToast({ title: 'Error updating notifications', type: 'error' });
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADCC9] shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF4EC] text-[#6F4E37] flex items-center justify-center border border-[#DCC8AF]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2C211B] font-heading">
              Operational Notification Center
            </h2>
            <p className="text-xs text-stone-500">
              Kitchen rushes, low-stock warnings, table reservations, and shift discrepancies.
            </p>
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#6F4E37] font-bold text-xs border border-[#DCC8AF] transition-colors"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-[#EADCC9] shadow-subtle divide-y divide-[#F5EBDD] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            No new notifications. All operational parameters normal!
          </div>
        ) : (
          notifications.map((notif) => {
            const isUrgent = notif.type === 'URGENT';
            const isWarning = notif.type === 'WARNING';
            const isSuccess = notif.type === 'SUCCESS';

            return (
              <div
                key={notif.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  !notif.isRead ? 'bg-[#FAF6F0]/80' : 'bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUrgent
                        ? 'bg-rose-100 text-rose-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : isSuccess
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#FAF4EC] text-[#6F4E37]'
                    }`}
                  >
                    {isUrgent ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#2C211B]">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      {formatDateTime(notif.createdAt)}
                    </p>
                  </div>
                </div>

                {notif.link && (
                  <Link
                    href={notif.link}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF4EC] hover:bg-[#F5EBDD] text-[#6F4E37] font-bold text-xs shrink-0 border border-[#DCC8AF]"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
