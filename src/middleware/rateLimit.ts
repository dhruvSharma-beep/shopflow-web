import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// In-memory sliding window (replace with Redis for multi-instance)
const store = new Map<string, number[]>();

const RULES = [
  { prefix: '/api/auth',    max: 10,  windowMs: 60_000 },
  { prefix: '/api/checkout',max: 30,  windowMs: 60_000 },
  { prefix: '/api',         max: 120, windowMs: 60_000 },
];

export function rateLimitMiddleware(req: NextRequest): NextResponse | null {
  const ip   = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anon';
  const path = new URL(req.url).pathname;
  const rule = RULES.find(r => path.startsWith(r.prefix)) ?? RULES[RULES.length - 1];
  const key  = `${rule.prefix}:${ip}`;
  const now  = Date.now();
  const min  = now - rule.windowMs;

  const hits = (store.get(key) ?? []).filter(t => t > min);
  hits.push(now);
  store.set(key, hits);

  // GC: remove stale keys every ~500 requests
  if (store.size > 500) { for (const [k, v] of store) { if (v[v.length-1] < min) store.delete(k); } }

  if (hits.length > rule.max) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429, headers: { 'Retry-After': String(Math.ceil(rule.windowMs / 1000)) }
    });
  }
  return null;
}