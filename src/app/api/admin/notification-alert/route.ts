/**
 * Admin Notification Alert API
 *
 * GET /api/admin/notification-alert  — return current config (admin-only)
 * PUT /api/admin/notification-alert  — update config (admin-only)
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDB();

    if (db) {
      const row = await db
        .prepare('SELECT * FROM notification_alert WHERE id = 1')
        .first();

      if (row) {
        return NextResponse.json({
          enabled: row.enabled === 1,
          heading: row.heading,
          hasLearnMore: row.has_learn_more === 1,
          body: row.body ?? '',
          version: row.version,
          updatedAt: row.updated_at,
        });
      }
    }
  } catch {
    // Fall through
  }

  return NextResponse.json({
    enabled: false,
    heading: '',
    hasLearnMore: false,
    body: '',
    version: 1,
    updatedAt: null,
  });
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { enabled, heading, hasLearnMore, bodyText, bumpVersion } = body as {
      enabled?: boolean;
      heading?: string;
      hasLearnMore?: boolean;
      bodyText?: string;
      bumpVersion?: boolean;
    };

    if (hasLearnMore && !bodyText?.trim()) {
      return NextResponse.json(
        { error: 'Body text is required when Learn More is enabled' },
        { status: 400 }
      );
    }

    const db = getDB();

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Check if row exists
    const existing = await db
      .prepare('SELECT id FROM notification_alert WHERE id = 1')
      .first();

    if (existing) {
      await db
        .prepare(
          `UPDATE notification_alert
           SET enabled = COALESCE(?, enabled),
               heading = COALESCE(?, heading),
               has_learn_more = COALESCE(?, has_learn_more),
               body = COALESCE(?, body),
               version = CASE WHEN ? = 1 THEN version + 1 ELSE version END,
               updated_at = datetime('now')
           WHERE id = 1`
        )
        .bind(
          enabled !== undefined ? (enabled ? 1 : 0) : null,
          heading ?? null,
          hasLearnMore !== undefined ? (hasLearnMore ? 1 : 0) : null,
          bodyText ?? null,
          bumpVersion ? 1 : 0
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO notification_alert (id, enabled, heading, has_learn_more, body, version)
           VALUES (1, ?, ?, ?, ?, 1)`
        )
        .bind(
          enabled ? 1 : 0,
          heading ?? '',
          hasLearnMore ? 1 : 0,
          bodyText ?? ''
        )
        .run();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
