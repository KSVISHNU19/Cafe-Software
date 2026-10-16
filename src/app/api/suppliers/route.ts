import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [suppliers, purchaseOrders, inventoryItems] = await Promise.all([
      prisma.supplier.findMany({
        orderBy: { name: 'asc' },
        include: {
          items: true,
        },
      }),
      prisma.purchaseOrder.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true,
          items: {
            include: {
              inventoryItem: true,
            },
          },
        },
      }),
      prisma.inventoryItem.findMany({
        select: { id: true, name: true, sku: true, unit: true, costPerUnit: true, supplierId: true },
      }),
    ]);

    return NextResponse.json({ suppliers, purchaseOrders, inventoryItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supplierId, items = [], notes } = body;

    if (!supplierId || !items.length) {
      return NextResponse.json(
        { error: 'Supplier and at least one item are required' },
        { status: 400 }
      );
    }

    const cafe = await prisma.cafe.findFirst();
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${(2000 + count + 1).toString()}`;

    let totalCost = 0;
    const poItemsData = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const cost = Number(item.unitCost) || 0;
      const lineCost = qty * cost;
      totalCost += lineCost;

      return {
        inventoryItemId: item.inventoryItemId,
        quantity: qty,
        unitCost: cost,
        totalCost: lineCost,
      };
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        cafeId: cafe?.id || 'cafe-brewdesk-01',
        supplierId,
        poNumber,
        status: 'PENDING',
        totalCost,
        notes: notes || null,
        items: {
          create: poItemsData,
        },
      },
      include: {
        supplier: true,
        items: {
          include: { inventoryItem: true },
        },
      },
    });

    return NextResponse.json({ success: true, purchaseOrder: po });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { purchaseOrderId, action } = body;

    if (!purchaseOrderId) {
      return NextResponse.json({ error: 'purchaseOrderId required' }, { status: 400 });
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        items: {
          include: { inventoryItem: true },
        },
      },
    });

    if (!po) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    if (action === 'RECEIVE') {
      // Transactionally mark PO received and increment inventory stock
      await prisma.$transaction(async (tx) => {
        await tx.purchaseOrder.update({
          where: { id: purchaseOrderId },
          data: {
            status: 'RECEIVED',
            receivedAt: new Date(),
          },
        });

        for (const item of po.items) {
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: {
              currentStock: { increment: item.quantity },
            },
          });

          await tx.stockMovement.create({
            data: {
              inventoryItemId: item.inventoryItemId,
              movementType: 'PURCHASE',
              quantity: item.quantity,
              reason: `Received goods from ${po.poNumber}`,
              reference: po.poNumber,
            },
          });
        }
      });

      return NextResponse.json({ success: true, message: 'Stock received and inventory updated!' });
    }

    if (action === 'CANCEL') {
      await prisma.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({ success: true, message: 'PO cancelled' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
