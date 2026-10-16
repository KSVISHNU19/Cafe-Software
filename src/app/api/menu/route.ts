import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [categories, products, modifierGroups] = await Promise.all([
      prisma.category.findMany({
        where: { active: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.product.findMany({
        orderBy: { name: 'asc' },
        include: {
          category: true,
          variants: true,
          productModifiers: {
            include: {
              modifierGroup: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      }),
      prisma.modifierGroup.findMany({
        include: {
          options: true,
        },
      }),
    ]);

    return NextResponse.json({
      categories,
      products,
      modifierGroups,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      categoryId,
      basePrice,
      costPrice = 0,
      description,
      image,
      prepStation = 'BARISTA',
      prepTimeMinutes = 3,
      variants = [],
      modifierGroupIds = [],
    } = body;

    if (!name || !categoryId || basePrice === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and base price are required' },
        { status: 400 }
      );
    }

    const cafe = await prisma.cafe.findFirst();
    const sku = `PROD-${Date.now().toString().slice(-6)}`;

    const newProduct = await prisma.product.create({
      data: {
        cafeId: cafe?.id || 'cafe-brewdesk-01',
        categoryId,
        name,
        sku,
        description: description || null,
        image: image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        basePrice: Number(basePrice),
        costPrice: Number(costPrice) || 0,
        prepStation,
        prepTimeMinutes: Number(prepTimeMinutes) || 3,
        availability: true,
        variants: {
          create: variants.map((v: any) => ({
            name: v.name,
            price: Number(v.price),
            sku: `${sku}-${v.name.slice(0, 3).toUpperCase()}`,
          })),
        },
        productModifiers: {
          create: modifierGroupIds.map((groupId: string) => ({
            modifierGroupId: groupId,
          })),
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, availability, basePrice } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (availability !== undefined) updateData.availability = availability;
    if (basePrice !== undefined) updateData.basePrice = Number(basePrice);

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
