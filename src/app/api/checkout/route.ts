import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { cartItems, shippingAddress } = await req.json();
  if (!cartItems?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

  const lineItems = cartItems.map((item: any) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name, images: item.image ? [item.image] : [] },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      status: 'pending',
      shippingAddress: JSON.stringify(shippingAddress),
      items: JSON.stringify(cartItems),
      total: cartItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
    },
  });

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=1`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=1`,
    metadata: { orderId: order.id, userId: session.user.id },
    payment_intent_data: { metadata: { orderId: order.id } },
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } });
  return NextResponse.json({ url: checkout.url });
}