import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [tables, reservations] = await Promise.all([
      prisma.cafeTable.findMany({
        orderBy: { tableNumber: 'asc' },
        include: {
          orders: {
            where: {
              status: {
                in: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'],
              },
            },
            take: 1,
            include: {
              items: true,
            },
          },
        },
      }),
      prisma.reservation.findMany({
        orderBy: { reservationTime: 'asc' },
        include: {
          table: true,
        },
      }),
    ]);

    return NextResponse.json({ tables, reservations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { tableId, status } = body;

    if (!tableId || !status) {
      return NextResponse.json({ error: 'tableId and status are required' }, { status: 400 });
    }

    const updated = await prisma.cafeTable.update({
      where: { id: tableId },
      data: {
        status,
        ...(status === 'AVAILABLE' ? { currentOrderId: null } : {}),
      },
    });

    return NextResponse.json({ success: true, table: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tableId,
      customerName,
      customerPhone,
      partySize = 2,
      reservationTime,
      notes,
    } = body;

    if (!customerName || !reservationTime) {
      return NextResponse.json(
        { error: 'Customer name and reservation time are required' },
        { status: 400 }
      );
    }

    const cafe = await prisma.cafe.findFirst();

    const reservation = await prisma.reservation.create({
      data: {
        cafeId: cafe?.id || 'cafe-brewdesk-01',
        tableId: tableId || null,
        customerName,
        customerPhone: customerPhone || null,
        partySize: Number(partySize) || 2,
        reservationTime: new Date(reservationTime),
        notes: notes || null,
        status: 'CONFIRMED',
      },
    });

    if (tableId) {
      await prisma.cafeTable.update({
        where: { id: tableId },
        data: { status: 'RESERVED' },
      });
    }

    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
