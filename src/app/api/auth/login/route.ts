import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signJWT } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.password) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  if (!user.isActive) return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = signJWT({ sub: user.id, email: user.email, role: user.role });
  const res = NextResponse.json({ success: true });
  res.cookies.set('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 604800 });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return res;
}