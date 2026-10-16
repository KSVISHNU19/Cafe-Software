import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [pendingKitchenCount, lowStockCount, unreadNotifsCount] = await Promise.all([
      prisma.order.count({
        where: {
          status: {
            in: ['PLACED', 'ACCEPTED', 'PREPARING'],
          },
        },
      }),
      prisma.inventoryItem.count({
        where: {
          currentStock: {
            lte: prisma.inventoryItem.fields.reorderLevel,
          },
        },
      }),
      prisma.notification.count({
        where: {
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      pendingKitchenCount,
      lowStockCount,
      unreadNotifsCount,
    });
  } catch {
    return NextResponse.json({
      pendingKitchenCount: 2,
      lowStockCount: 3,
      unreadNotifsCount: 3,
    });
  }
}
