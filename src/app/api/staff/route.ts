import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [users, shifts] = await Promise.all([
      prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          pinCode: true,
          avatar: true,
          createdAt: true,
        },
      }),
      prisma.shift.findMany({
        orderBy: { startTime: 'desc' },
        take: 20,
        include: {
          user: {
            select: { name: true, role: true },
          },
        },
      }),
    ]);

    const activeShift = shifts.find((s) => s.status === 'OPEN');

    // Calculate cash orders processed during active shift
    let currentShiftCashSales = 0;
    if (activeShift) {
      const cashPayments = await prisma.payment.findMany({
        where: {
          method: 'CASH',
          status: 'COMPLETED',
          createdAt: { gte: activeShift.startTime },
        },
      });
      currentShiftCashSales = cashPayments.reduce((sum, p) => sum + p.amount, 0);
    }

    return NextResponse.json({
      users,
      shifts,
      activeShift,
      currentShiftCashSales,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, openingCash, actualClosingCash, notes } = body;

    const cafe = await prisma.cafe.findFirst();

    if (action === 'OPEN') {
      const openShift = await prisma.shift.create({
        data: {
          cafeId: cafe?.id || 'cafe-brewdesk-01',
          userId,
          openingCash: Number(openingCash) || 150.0,
          status: 'OPEN',
          notes: notes || 'Register drawer opened',
        },
        include: { user: true },
      });
      return NextResponse.json({ success: true, shift: openShift });
    }

    if (action === 'CLOSE') {
      const { shiftId } = body;
      const currentShift = await prisma.shift.findUnique({
        where: { id: shiftId },
      });

      if (!currentShift) {
        return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
      }

      // Calculate expected cash: opening cash + cash payments since shift started
      const cashPayments = await prisma.payment.findMany({
        where: {
          method: 'CASH',
          status: 'COMPLETED',
          createdAt: { gte: currentShift.startTime },
        },
      });

      const totalCashSales = cashPayments.reduce((sum, p) => sum + p.amount, 0);
      const expectedClosing = currentShift.openingCash + totalCashSales;
      const actualClosing = Number(actualClosingCash) || 0;
      const discrepancy = actualClosing - expectedClosing;

      const closedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: {
          endTime: new Date(),
          expectedClosingCash: parseFloat(expectedClosing.toFixed(2)),
          actualClosingCash: parseFloat(actualClosing.toFixed(2)),
          discrepancy: parseFloat(discrepancy.toFixed(2)),
          status: 'CLOSED',
          notes: notes || (discrepancy === 0 ? 'Balanced' : `Drawer discrepancy of $${discrepancy.toFixed(2)}`),
        },
      });

      // Audit log if discrepancy
      if (Math.abs(discrepancy) > 0.01) {
        await prisma.auditLog.create({
          data: {
            cafeId: cafe?.id || 'cafe-brewdesk-01',
            action: 'CASH_DISCREPANCY_FLAG',
            entity: 'Shift',
            entityId: closedShift.id,
            details: `Cash register closed with discrepancy of ₹${discrepancy.toFixed(2)} (Expected: ₹${expectedClosing.toFixed(2)}, Actual: ₹${actualClosing.toFixed(2)})`,
          },
        });
      }

      return NextResponse.json({ success: true, shift: closedShift });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
