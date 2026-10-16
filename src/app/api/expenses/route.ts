import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    return NextResponse.json({
      expenses,
      totalExpenses,
      byCategory,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, amount, description, approvedBy, receiptUrl } = body;

    if (!category || !amount || !description) {
      return NextResponse.json(
        { error: 'Category, amount, and description are required' },
        { status: 400 }
      );
    }

    const cafe = await prisma.cafe.findFirst();

    const newExpense = await prisma.expense.create({
      data: {
        cafeId: cafe?.id || 'cafe-brewdesk-01',
        category,
        amount: Number(amount),
        description,
        approvedBy: approvedBy || 'Elena Vance (Owner)',
        receiptUrl: receiptUrl || null,
        date: new Date(),
      },
    });

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
