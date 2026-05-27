/**
 * POST /api/admin/login
 * Body: { password: string }
 * Sets an HttpOnly session cookie on success.
 */

import { NextResponse } from 'next/server';
import { buildSessionCookie } from '@/lib/adminAuth';
import { getRequestContext } from '@cloudflare/next-on-pages';


export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    let adminPassword = process.env.ADMIN_PASSWORD;
    try {
      adminPassword = getRequestContext().env.ADMIN_PASSWORD || adminPassword;
    } catch {
      // getRequestContext throws when not running in Cloudflare context (e.g. local dev)
    }

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
