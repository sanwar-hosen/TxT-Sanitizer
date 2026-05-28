/**
 * GET /api/popup
 * Returns the popup configuration (content and enabled flag).
 * Reads from D1 in production; returns disabled default in local dev.
 */

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const db = getDB();

    if (db) {
      const row = await db
        .prepare('SELECT content, enabled, version FROM popup_config WHERE id = 1')
        .first();

      if (row) {
        return NextResponse.json({
          content: row.content as string,
          enabled: row.enabled === 1,
          version: row.version as number,
        });
      }
    }
  } catch {
    // DB not available — fall through
  }

  // Fallback: popup disabled
  return NextResponse.json({ content: '', enabled: false, version: 1 });
}
