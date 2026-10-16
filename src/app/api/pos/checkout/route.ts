import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderType = 'DINE_IN',
      tableId,
      customerId,
      items = [],
      discount = 0,
      paymentMethod = 'CASH',
      tenderedAmount,
      notes = '',
      createdById,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    // 1. Get Cafe settings for tax rate
    const cafe = await prisma.cafe.findFirst();
    const taxRatePercent = cafe?.taxRatePercent ?? 8.5;

    // 2. Calculate subtotal server-side
    let calculatedSubtotal = 0;
    const sanitizedItems = items.map((item: any) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      let itemModifierTotal = 0;

      if (Array.isArray(item.modifiers)) {
        itemModifierTotal = item.modifiers.reduce(
          (acc: number, mod: any) => acc + (Number(mod.price) || 0),
          0
        );
      }

      const itemTotal = (unitPrice + itemModifierTotal) * quantity;
      calculatedSubtotal += itemTotal;

      return {
        productId: item.productId || null,
        productName: item.productName || 'Cafe Item',
        variantName: item.variantName || null,
        quantity,
        unitPrice: unitPrice + itemModifierTotal,
        subtotal: itemTotal,
        notes: item.notes || null,
        status: 'PENDING',
        prepStation: item.prepStation || 'BARISTA',
        modifiers: item.modifiers || [],
      };
    });

    // 3. Calculate discount, tax, total
    const safeDiscount = Math.min(calculatedSubtotal, Math.max(0, Number(discount) || 0));
    const taxableAmount = Math.max(0, calculatedSubtotal - safeDiscount);
    const calculatedTax = parseFloat(((taxableAmount * taxRatePercent) / 100).toFixed(2));
    const calculatedTotal = parseFloat((taxableAmount + calculatedTax).toFixed(2));

    // 4. Generate unique readable order number: BD-(sequence)
    const orderCount = await prisma.order.count();
    const orderNumber = `BD-${(1000 + orderCount + 1).toString()}`;

    // 5. Calculate change if cash
    let changeAmount = 0;
    if (paymentMethod === 'CASH' && tenderedAmount) {
      changeAmount = Math.max(0, Number(tenderedAmount) - calculatedTotal);
    }

    // 6. Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          cafeId: cafe?.id || 'cafe-brewdesk-01',
          orderNumber,
          orderType,
          tableId: tableId || null,
          customerId: customerId || null,
          status: 'PLACED',
          paymentStatus: 'PAID',
          subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
          discount: parseFloat(safeDiscount.toFixed(2)),
          tax: calculatedTax,
          total: calculatedTotal,
          notes: notes || null,
          createdById: createdById || null,
          items: {
            create: sanitizedItems.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              variantName: item.variantName,
              quantity: item.quantity,
              unitPrice: parseFloat(item.unitPrice.toFixed(2)),
              subtotal: parseFloat(item.subtotal.toFixed(2)),
              notes: item.notes,
              status: 'PENDING',
              prepStation: item.prepStation,
              modifiers: {
                create: item.modifiers.map((mod: any) => ({
                  modifierOptionName: mod.modifierOptionName || mod.name,
                  price: Number(mod.price) || 0,
                })),
              },
            })),
          },
          payments: {
            create: [
              {
                method: paymentMethod,
                amount: calculatedTotal,
                status: 'COMPLETED',
                tenderedAmount: tenderedAmount ? Number(tenderedAmount) : calculatedTotal,
                changeAmount: parseFloat(changeAmount.toFixed(2)),
                reference: `${paymentMethod.toLowerCase()}_ref_${Date.now().toString().slice(-6)}`,
              },
            ],
          },
        },
        include: {
          items: {
            include: {
              modifiers: true,
            },
          },
          payments: true,
          table: true,
          customer: true,
        },
      });

      // Update table status if dine-in
      if (orderType === 'DINE_IN' && tableId) {
        await tx.cafeTable.update({
          where: { id: tableId },
          data: {
            status: 'OCCUPIED',
            currentOrderId: newOrder.id,
          },
        });
      }

      // Award Loyalty Points if customer assigned (1 point per dollar spent)
      if (customerId) {
        const pointsEarned = Math.floor(calculatedTotal);
        if (pointsEarned > 0) {
          await tx.customer.update({
            where: { id: customerId },
            data: {
              loyaltyPoints: { increment: pointsEarned },
              totalSpent: { increment: calculatedTotal },
              visitCount: { increment: 1 },
            },
          });

          await tx.loyaltyTransaction.create({
            data: {
              customerId,
              points: pointsEarned,
              type: 'EARNED',
              reason: `Earned from Order ${orderNumber}`,
              orderId: newOrder.id,
            },
          });
        }
      }

      // Create Kitchen Notification
      await tx.notification.create({
        data: {
          cafeId: cafe?.id || 'cafe-brewdesk-01',
          title: `New Order ${orderNumber}`,
          message: `${orderType} • ${sanitizedItems.length} items • Total: ₹${calculatedTotal.toFixed(2)}`,
          type: 'INFO',
          link: '/kitchen',
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: result,
      orderNumber: result.orderNumber,
      total: result.total,
      changeAmount,
    });
  } catch (error: any) {
    console.error('POS Checkout Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process checkout transaction' },
      { status: 500 }
    );
  }
}
