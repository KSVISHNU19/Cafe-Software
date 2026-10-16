'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  UtensilsCrossed,
  Grid3X3,
  Flame,
  Boxes,
  Truck,
  Users2,
  Clock,
  ReceiptIndianRupee,
  BarChart3,
  Bell,
  Settings,
  Coffee,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ROLE_PERMISSIONS, RoleType } from '@/lib/utils';

interface NavItem {
  key: string;
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const {
    currentUser,
    switchUserRole,
    toasts,
    removeToast,
    pendingKitchenCount,
    lowStockCount,
    unreadNotifsCount,
  } = useApp();

  const permissions = ROLE_PERMISSIONS[currentUser.role];

  const allNavItems: NavItem[] = [
    { key: 'dashboard', name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { key: 'pos', name: 'Point of Sale', href: '/pos', icon: CreditCard },
    { key: 'orders', name: 'Orders', href: '/orders', icon: ShoppingBag },
    { key: 'menu', name: 'Menu & Recipes', href: '/menu', icon: UtensilsCrossed },
    { key: 'kitchen', name: 'Kitchen KDS', href: '/kitchen', icon: Flame, badge: pendingKitchenCount },
    { key: 'inventory', name: 'Inventory & Stock', href: '/inventory', icon: Boxes, badge: lowStockCount },
    { key: 'suppliers', name: 'Suppliers & POs', href: '/suppliers', icon: Truck },
    { key: 'customers', name: 'Customers & Loyalty', href: '/customers', icon: Users2 },
    { key: 'staff', name: 'Staff & Shifts', href: '/staff', icon: Clock },
    { key: 'expenses', name: 'Expenses', href: '/expenses', icon: ReceiptIndianRupee },
    { key: 'reports', name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { key: 'notifications', name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadNotifsCount },
    { key: 'settings', name: 'Cafe Settings', href: '/settings', icon: Settings },
  ];

  // Filter navigation by role
  const visibleNav = allNavItems.filter((item) =>
    permissions.allowedNav.includes(item.key)
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF6F0] text-[#2C211B]">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#241710] text-[#F5EBDD] border-r border-[#3B261B] z-20 shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#3B261B]/80 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C68B59] to-[#6F4E37] flex items-center justify-center text-white shadow-md">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide text-white">Cafe</h1>
            <p className="text-[11px] text-[#DCC8AF]/80 uppercase tracking-wider font-medium">Artisan Coffee POS</p>
          </div>
        </div>

        {/* Quick POS Launch Button */}
        <div className="p-3">
          <Link
            href="/pos"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C68B59] to-[#8D674A] hover:from-[#B07B4A] hover:to-[#7A563B] text-white font-medium text-sm shadow-md transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {visibleNav.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#6F4E37] text-white shadow-sm'
                    : 'text-[#DCC8AF] hover:text-white hover:bg-[#3B261B]/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#F5EBDD]' : 'text-[#C68B59]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.key === 'kitchen'
                        ? 'bg-amber-600 text-white'
                        : item.key === 'inventory'
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#C68B59] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-[#3B261B]/80 bg-[#1D120D]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#C68B59]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[#C68B59] font-medium tracking-wide">
                {ROLE_PERMISSIONS[currentUser.role].name}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 bg-[#241710] text-[#F5EBDD] h-full shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-[#3B261B]">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#C68B59]" />
                <span className="font-bold text-white">Cafe</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {visibleNav.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-[#6F4E37] text-white' : 'text-[#DCC8AF] hover:bg-[#3B261B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#C68B59]" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 bg-[#FFFDF8] border-b border-[#EADCC9] flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#6F4E37] hover:bg-[#F5EBDD]"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs uppercase tracking-wider text-[#8D674A] font-semibold">Store Location</span>
              <p className="text-sm font-semibold text-[#2C211B] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Cafe Roastery — Downtown Flagship
              </p>
            </div>
          </div>

          {/* Right Header: Role Simulator Switcher & Notifications */}
          <div className="flex items-center gap-3">
            {/* Quick Role Simulator dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCC8AF] bg-[#FAF4EC] hover:bg-[#F5EBDD] text-xs font-medium text-[#4A3023] transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#6F4E37]" />
                <span className="hidden sm:inline text-stone-500 font-normal">Role:</span>
                <span className="font-semibold text-[#3B261B]">{ROLE_PERMISSIONS[currentUser.role].name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8D674A]" />
              </button>

              {roleMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setRoleMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EADCC9] py-2 z-40 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-[#F5EBDD]">
                      <p className="text-xs font-bold text-[#3B261B] uppercase tracking-wider">Switch Simulated Role</p>
                      <p className="text-[11px] text-stone-500">Test multi-role permissions instantly</p>
                    </div>
                    {(['OWNER', 'MANAGER', 'CASHIER', 'BARISTA', 'INVENTORY'] as RoleType[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          switchUserRole(role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-[#FAF4EC] transition-colors ${
                          currentUser.role === role ? 'font-bold text-[#6F4E37] bg-[#F5EBDD]/60' : 'text-stone-700'
                        }`}
                      >
                        <div>
                          <p>{ROLE_PERMISSIONS[role].name}</p>
                          <p className="text-[10px] text-stone-400">PIN: {role === 'OWNER' ? '1111' : role === 'MANAGER' ? '2222' : role === 'BARISTA' ? '3333' : role === 'CASHIER' ? '4444' : '5555'}</p>
                        </div>
                        {currentUser.role === role && (
                          <CheckCircle2 className="w-4 h-4 text-[#6F4E37]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-[#6F4E37] hover:bg-[#F5EBDD] transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </Link>

            {/* Quick POS Button in header */}
            <Link
              href="/pos"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3B261B] hover:bg-[#4A3023] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#C68B59]" />
              <span>POS Terminal</span>
            </Link>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white shadow-xl border border-[#EADCC9] text-stone-800 animate-in slide-in-from-bottom-3 duration-200"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#6F4E37] shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#3B261B]">{toast.title}</p>
              {toast.message && <p className="text-xs text-stone-600 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
