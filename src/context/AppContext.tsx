'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RoleType, ROLE_PERMISSIONS } from '@/lib/utils';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatar?: string;
  pinCode?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  availableUsers: UserSession[];
  switchUserRole: (role: RoleType) => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  pendingKitchenCount: number;
  lowStockCount: number;
  unreadNotifsCount: number;
  refreshStats: () => Promise<void>;
}

const DEFAULT_USERS: UserSession[] = [
  {
    id: 'user-owner-01',
    name: 'Elena Vance',
    email: 'owner@cafe.internal',
    role: 'OWNER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    pinCode: '1111',
  },
  {
    id: 'user-manager-01',
    name: 'Marcus Cole',
    email: 'manager@cafe.internal',
    role: 'MANAGER',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    pinCode: '2222',
  },
  {
    id: 'user-cashier-01',
    name: 'Leo Morales',
    email: 'cashier@cafe.internal',
    role: 'CASHIER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    pinCode: '4444',
  },
  {
    id: 'user-barista-01',
    name: 'Samira Patel',
    email: 'barista@cafe.internal',
    role: 'BARISTA',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    pinCode: '3333',
  },
  {
    id: 'user-inventory-01',
    name: 'Chloe Bennett',
    email: 'inventory@cafe.internal',
    role: 'INVENTORY',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    pinCode: '5555',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession>(DEFAULT_USERS[0]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pendingKitchenCount, setPendingKitchenCount] = useState<number>(2);
  const [lowStockCount, setLowStockCount] = useState<number>(3);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(3);

  const switchUserRole = (role: RoleType) => {
    const found = DEFAULT_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      showToast({
        title: `Switched to ${ROLE_PERMISSIONS[role].name}`,
        message: `Active session updated for ${found.name}`,
        type: 'info',
      });
    }
  };

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.pendingKitchenCount !== undefined) setPendingKitchenCount(data.pendingKitchenCount);
        if (data.lowStockCount !== undefined) setLowStockCount(data.lowStockCount);
        if (data.unreadNotifsCount !== undefined) setUnreadNotifsCount(data.unreadNotifsCount);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: DEFAULT_USERS,
        switchUserRole,
        toasts,
        showToast,
        removeToast,
        pendingKitchenCount,
        lowStockCount,
        unreadNotifsCount,
        refreshStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
