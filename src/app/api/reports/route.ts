import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'all'; // today, 7d, 30d, all

    let startDate: Date | undefined;
    const now = new Date();

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    }

    const orderWhere: any = {
      status: { not: 'CANCELLED' },
      paymentStatus: 'PAID',
    };

    if (startDate) {
      orderWhere.createdAt = { gte: startDate };
    }

    const [orders, expenses, products] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        include: {
          items: true,
          payments: true,
        },
      }),
      prisma.expense.findMany({
        where: startDate ? { date: { gte: startDate } } : {},
      }),
      prisma.product.findMany({
        include: { category: true },
      }),
    ]);

    // Product cost lookup map
    const productCostMap = new Map<string, { cost: number; category: string }>();
    products.forEach((p) => {
      productCostMap.set(p.name, {
        cost: p.costPrice || 0,
        category: p.category?.name || 'Other',
      });
    });

    let grossSales = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let netSales = 0;
    let totalCOGS = 0;

    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};
    const categorySalesMap: Record<string, number> = {};
    const paymentMethodMap: Record<string, number> = { CASH: 0, CARD: 0, UPI: 0, OTHER: 0 };
    const orderTypeMap: Record<string, number> = { DINE_IN: 0, TAKEAWAY: 0, DELIVERY: 0 };

    orders.forEach((o) => {
      grossSales += o.subtotal;
      totalDiscount += o.discount;
      totalTax += o.tax;
      netSales += o.total;

      orderTypeMap[o.orderType] = (orderTypeMap[o.orderType] || 0) + 1;

      // Payments
      o.payments.forEach((p) => {
        paymentMethodMap[p.method] = (paymentMethodMap[p.method] || 0) + p.amount;
      });

      // Items
      o.items.forEach((item) => {
        const prodInfo = productCostMap.get(item.productName) || { cost: 0, category: 'General' };
        totalCOGS += prodInfo.cost * item.quantity;

        const cat = prodInfo.category;
        categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.subtotal;

        if (!productSalesMap[item.productName]) {
          productSalesMap[item.productName] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            category: cat,
          };
        }
        productSalesMap[item.productName].quantity += item.quantity;
        productSalesMap[item.productName].revenue += item.subtotal;
      });
    });

    const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const estimatedGrossProfit = netSales - totalCOGS;
    const estimatedOperatingResult = estimatedGrossProfit - totalOperatingExpenses;
    const averageOrderValue = orders.length > 0 ? netSales / orders.length : 0;

    const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        grossSales: parseFloat(grossSales.toFixed(2)),
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        netSales: parseFloat(netSales.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        totalCOGS: parseFloat(totalCOGS.toFixed(2)),
        estimatedGrossProfit: parseFloat(estimatedGrossProfit.toFixed(2)),
        totalOperatingExpenses: parseFloat(totalOperatingExpenses.toFixed(2)),
        estimatedOperatingResult: parseFloat(estimatedOperatingResult.toFixed(2)),
      },
      topProducts,
      categorySales: categorySalesMap,
      paymentMethods: paymentMethodMap,
      orderTypes: orderTypeMap,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
