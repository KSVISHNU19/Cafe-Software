import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Cafe — Complete Cafe Management System',
  description: 'Enterprise point of sale, kitchen display system, inventory, tables, and analytics for modern specialty coffee cafes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#C68B59] selection:text-white">
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
