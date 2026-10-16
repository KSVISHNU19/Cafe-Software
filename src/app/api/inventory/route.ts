import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [items, movements] = await Promise.all([
      prisma.inventoryItem.findMany({
        orderBy: { name: 'asc' },
        include: {
          supplier: true,
        },
      }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          inventoryItem: true,
        },
      }),
    ]);

    const lowStockItems = items.filter((item) => item.currentStock <= item.reorderLevel);

    return NextResponse.json({
      items,
      movements,
      lowStockItems,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inventoryItemId, movementType, quantity, reason, reference } = body;

    if (!inventoryItemId || !movementType || quantity === undefined) {
      return NextResponse.json(
        { error: 'inventoryItemId, movementType, and quantity are required' },
        { status: 400 }
      );
    }

    const qty = Number(quantity);

    const result = await prisma.$transaction(async (tx) => {
      // Calculate delta
      // PURCHASE adds stock, USAGE or WASTAGE deducts stock
      const delta = (movementType === 'PURCHASE' || movementType === 'RETURN') ? Math.abs(qty) : -Math.abs(qty);

      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          currentStock: {
            increment: delta,
          },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          inventoryItemId,
          movementType,
          quantity: delta,
          reason: reason || null,
          reference: reference || 'Manual Adjustment',
        },
      });

      // If low stock after deduction, trigger a notification
      if (updatedItem.currentStock <= updatedItem.reorderLevel) {
        await tx.notification.create({
          data: {
            cafeId: updatedItem.cafeId,
            title: `Low Stock Alert: ${updatedItem.name}`,
            message: `Current stock (${updatedItem.currentStock} ${updatedItem.unit}) has fallen below reorder level (${updatedItem.reorderLevel} ${updatedItem.unit}).`,
            type: 'WARNING',
            link: '/inventory',
          },
        });
      }

      return { updatedItem, movement };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
