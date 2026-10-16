import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
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
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, paymentStatus, refundAmount, refundReason, authorizedBy } = body;

    const existing = await prisma.order.findUnique({
      where: { id: params.id },
      include: { table: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle Refund if requested
    if (refundAmount) {
      const amount = Math.min(existing.total, Number(refundAmount));
      await prisma.$transaction([
        prisma.refund.create({
          data: {
            orderId: params.id,
            amount,
            reason: refundReason || 'Customer requested refund',
            authorizedBy: authorizedBy || 'Manager',
          },
        }),
        prisma.order.update({
          where: { id: params.id },
          data: {
            paymentStatus: amount >= existing.total ? 'REFUNDED' : 'PARTIALLY_PAID',
            status: 'CANCELLED',
          },
        }),
        prisma.auditLog.create({
          data: {
            cafeId: existing.cafeId,
            action: 'REFUND_PROCESSED',
            entity: 'Order',
            entityId: existing.orderNumber,
            details: `Refunded ₹${amount.toFixed(2)}. Reason: ${refundReason || 'N/A'}. Authorized by: ${authorizedBy || 'Manager'}`,
          },
        }),
      ]);

      // If table occupied, free table
      if (existing.tableId) {
        await prisma.cafeTable.update({
          where: { id: existing.tableId },
          data: { status: 'NEEDS_CLEANING' },
        });
      }

      return NextResponse.json({ success: true, message: 'Refund processed successfully' });
    }

    // Standard status advance
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: true,
        table: true,
      },
    });

    // If order completed or cancelled, update table to NEEDS_CLEANING
    if ((status === 'COMPLETED' || status === 'CANCELLED') && existing.tableId) {
      await prisma.cafeTable.update({
        where: { id: existing.tableId },
        data: {
          status: 'NEEDS_CLEANING',
          currentOrderId: null,
        },
      });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
