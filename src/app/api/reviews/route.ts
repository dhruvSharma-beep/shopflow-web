import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const ReviewSchema = z.object({
  productId: z.string().cuid(),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().min(3).max(100),
  body:      z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 });

  const body = ReviewSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 422 });
  const { productId, rating, title, body: reviewBody } = body.data;

  // One review per user per product
  const existing = await prisma.review.findFirst({ where: { userId: session.user.id, productId } });
  if (existing) return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });

  // User must have purchased the product to review it
  const purchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId: session.user.id, status: 'fulfilled' } },
  });
  if (!purchased) return NextResponse.json({ error: 'You can only review products you have purchased' }, { status: 403 });

  const review = await prisma.review.create({
    data: { userId: session.user.id, productId, rating, title, body: reviewBody, verified: true },
  });

  // Update product average rating
  const agg = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
  await prisma.product.update({ where: { id: productId }, data: { avgRating: agg._avg.rating, reviewCount: agg._count } });

  return NextResponse.json({ success: true, review }, { status: 201 });
}