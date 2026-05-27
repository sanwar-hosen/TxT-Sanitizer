/**
 * POST /api/admin/login
 * Body: { password: string }
 * Sets an HttpOnly session cookie on success.
 */

import { NextResponse } from 'next/server';
import { buildSessionCookie } from '@/lib/adminAuth';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    const ctx = (request as any).cf?.env ?? (globalThis as any).__env__;
    const adminPassword = ctx?.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin not configured' },
        { status: 503 }
      );
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.headers.set('Set-Cookie', buildSessionCookie(adminPassword));
    return response;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
