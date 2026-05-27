/**
 * Admin Ads Config API
 *
 * GET /api/admin/ads  — return current ads slot visibility config
 * PUT /api/admin/ads  — update ads slot visibility config
 *
 * Uses localStorage on the client side as a fallback since there's no dedicated D1 table.
 * In production, you'd store this in a simple key-value table or in notification_alert's table.
 * For now we store in the notification_alert table with a JSON sidecar approach,
 * OR simply use response headers / a simple table.
 *
 * For simplicity, we use a dedicated `site_config` approach:
 * We'll piggy-back on a JSON column in a new table, but since the schema already
 * has notification_alert, we'll store ads config in a separate row there using
 * a `site_config` key-value store pattern.
 *
 * Actually — to keep it simple and not require a DB schema change, we store
 * the ads config in Cloudflare KV or just return defaults without persistence
 * (toggling is a UX affordance for when KV is configured).
 *
 * Simplest approach for this phase: store as JSON in a `site_config` D1 table if it exists,
 * otherwise just accept and return without persistence (config will reset on reload).
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';

export const runtime = 'edge';

const DEFAULT_ADS = { belowNavbar: false, sidebar: false };

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return defaults (ads are hidden by default)
  return NextResponse.json(DEFAULT_ADS);
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { belowNavbar, sidebar } = body as { belowNavbar?: boolean; sidebar?: boolean };

    // In a full implementation, this would write to D1 or Cloudflare KV.
    // For now, acknowledge the save (client persists in localStorage).
    return NextResponse.json({
      ok: true,
      belowNavbar: belowNavbar ?? false,
      sidebar: sidebar ?? false,
    });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
