import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [customers, coupons] = await Promise.all([
      prisma.customer.findMany({
        orderBy: { totalSpent: 'desc' },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { id: true, orderNumber: true, total: true, createdAt: true, status: true },
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      }),
      prisma.coupon.findMany({
        where: { active: true },
        orderBy: { code: 'asc' },
      }),
    ]);

    return NextResponse.json({ customers, coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const cafe = await prisma.cafe.findFirst();

    const customer = await prisma.customer.create({
      data: {
        cafeId: cafe?.id || 'cafe-brewdesk-01',
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        loyaltyPoints: 50, // Welcome bonus points!
      },
    });

    // Record welcome bonus in loyalty transaction ledger
    await prisma.loyaltyTransaction.create({
      data: {
        customerId: customer.id,
        points: 50,
        type: 'EARNED',
        reason: 'Welcome bonus on sign-up',
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
