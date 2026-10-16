import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency = '₹'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0.00`;
  }
  return `${currency}${amount.toFixed(2)}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return `${formatDate(d)} • ${formatTime(d)}`;
}

export function formatElapsedMinutes(startDate: string | Date | null | undefined): number {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / (1000 * 60)));
}

export type RoleType = 'OWNER' | 'MANAGER' | 'CASHIER' | 'BARISTA' | 'INVENTORY';

export const ROLE_PERMISSIONS: Record<RoleType, {
  name: string;
  allowedNav: string[];
  canRefund: boolean;
  canEditMenu: boolean;
  canViewReports: boolean;
  canManageStaff: boolean;
  canManageInventory: boolean;
  canTakeOrders: boolean;
}> = {
  OWNER: {
    name: 'Owner / Super Admin',
    allowedNav: ['dashboard', 'pos', 'orders', 'menu', 'kitchen', 'inventory', 'suppliers', 'customers', 'staff', 'expenses', 'reports', 'notifications', 'settings'],
    canRefund: true,
    canEditMenu: true,
    canViewReports: true,
    canManageStaff: true,
    canManageInventory: true,
    canTakeOrders: true,
  },
  MANAGER: {
    name: 'Store Manager',
    allowedNav: ['dashboard', 'pos', 'orders', 'menu', 'kitchen', 'inventory', 'suppliers', 'customers', 'staff', 'expenses', 'reports', 'notifications', 'settings'],
    canRefund: true,
    canEditMenu: true,
    canViewReports: true,
    canManageStaff: true,
    canManageInventory: true,
    canTakeOrders: true,
  },
  CASHIER: {
    name: 'Cashier & Front Desk',
    allowedNav: ['pos', 'orders', 'customers', 'notifications'],
    canRefund: false,
    canEditMenu: false,
    canViewReports: false,
    canManageStaff: false,
    canManageInventory: false,
    canTakeOrders: true,
  },
  BARISTA: {
    name: 'Barista / Kitchen Staff',
    allowedNav: ['kitchen', 'orders', 'notifications'],
    canRefund: false,
    canEditMenu: false,
    canViewReports: false,
    canManageStaff: false,
    canManageInventory: false,
    canTakeOrders: false,
  },
  INVENTORY: {
    name: 'Inventory & Supplies Staff',
    allowedNav: ['inventory', 'suppliers', 'expenses', 'notifications'],
    canRefund: false,
    canEditMenu: false,
    canViewReports: false,
    canManageStaff: false,
    canManageInventory: true,
    canTakeOrders: false,
  },
};
