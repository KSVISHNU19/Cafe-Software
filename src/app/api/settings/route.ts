import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cafe = await prisma.cafe.findFirst();
    return NextResponse.json({ cafe });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { name, tagline, address, phone, currency, currencyCode, taxRatePercent, receiptHeader, receiptFooter } = body;

    const existing = await prisma.cafe.findFirst();
    if (!existing) {
      return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
    }

    const updated = await prisma.cafe.update({
      where: { id: existing.id },
      data: {
        ...(name && { name }),
        ...(tagline && { tagline }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(currency && { currency }),
        ...(currencyCode && { currencyCode }),
        ...(taxRatePercent !== undefined && { taxRatePercent: Number(taxRatePercent) }),
        ...(receiptHeader && { receiptHeader }),
        ...(receiptFooter && { receiptFooter }),
      },
    });

    return NextResponse.json({ success: true, cafe: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
