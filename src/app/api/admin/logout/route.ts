/**
 * POST /api/admin/logout
 * Clears the admin session cookie.
 */

import { NextResponse } from 'next/server';
import { buildClearCookie } from '@/lib/adminAuth';

export const runtime = 'edge';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set('Set-Cookie', buildClearCookie());
  return response;
}
