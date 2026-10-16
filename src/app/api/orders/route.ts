import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const orderType = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = Number(searchParams.get('limit')) || 50;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (orderType && orderType !== 'ALL') {
      where.orderType = orderType;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { table: { tableNumber: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: {
          include: {
            modifiers: true,
          },
        },
        payments: true,
        refunds: true,
        table: true,
        customer: true,
        createdBy: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
