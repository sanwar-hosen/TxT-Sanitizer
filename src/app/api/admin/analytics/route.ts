/**
 * GET /api/admin/analytics
 * Returns aggregated analytics data from D1 for the admin dashboard.
 * Admin-only (session cookie required).
 *
 * Query params:
 *   ?range=30d | 6m | 12m  (default: 12m)
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const range = url.searchParams.get('range') ?? '12m';

  // Convert range to SQLite date filter
  let dateFilter: string;
  if (range === '30d') {
    dateFilter = "datetime('now', '-30 days')";
  } else if (range === '6m') {
    dateFilter = "datetime('now', '-6 months')";
  } else {
    dateFilter = "datetime('now', '-12 months')";
  }

  try {
    const db = getDB();

    if (!db) {
      // Return mock data for local dev
      return NextResponse.json(buildMockData(range));
    }

    // ── Summary totals ─────────────────────────────────────────────────────────
    const { results: totals } = await db
      .prepare(
        `SELECT
           event_type,
           COUNT(*) as count
         FROM analytics
         WHERE created_at >= ${dateFilter}
         GROUP BY event_type`
      )
      .all();

    const summary: Record<string, number> = { page_view: 0, sanitize: 0, feedback: 0 };
    for (const row of totals as { event_type: string; count: number }[]) {
      summary[row.event_type] = row.count;
    }

    const dateFormat = range === '30d' ? '%Y-%m-%d' : '%Y-%m';

    // ── Monthly breakdown (year-month bucketing) ───────────────────────────────
    const { results: monthly } = await db
      .prepare(
        `SELECT
           strftime('${dateFormat}', created_at) as month,
           event_type,
           COUNT(*) as count
         FROM analytics
         WHERE created_at >= ${dateFilter}
         GROUP BY month, event_type
         ORDER BY month ASC`
      )
      .all();

    // ── Generate dense time-series for the selected range to fill date/month gaps ──
    const expectedPeriods: string[] = [];
    const now = new Date();
    if (range === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        expectedPeriods.push(d.toISOString().split('T')[0]);
      }
    } else {
      const monthsCount = range === '6m' ? 6 : 12;
      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        expectedPeriods.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
      }
    }

    const eventTypes = ['page_view', 'sanitize', 'feedback'];
    const resultMap = new Map<string, number>();

    for (const row of monthly as { month: string; event_type: string; count: number }[]) {
      resultMap.set(`${row.month}:${row.event_type}`, row.count);
    }

    const filledMonthly: { month: string; event_type: string; count: number }[] = [];
    for (const period of expectedPeriods) {
      for (const type of eventTypes) {
        const count = resultMap.get(`${period}:${type}`) ?? 0;
        filledMonthly.push({ month: period, event_type: type, count });
      }
    }

    // ── Top presets from sanitize events ──────────────────────────────────────
    const { results: dbPresets } = await db
      .prepare('SELECT id, name FROM presets')
      .all();
    const presetNames: Record<string, string> = {};
    for (const p of dbPresets as { id: string; name: string }[]) {
      presetNames[p.id] = p.name;
    }

    const { results: sanitizeEvents } = await db
      .prepare(
        `SELECT metadata
         FROM analytics
         WHERE event_type = 'sanitize' AND created_at >= ${dateFilter}
         LIMIT 5000`
      )
      .all();

    const presetCounts: Record<string, { count: number; name?: string }> = {};
    for (const row of sanitizeEvents as { metadata: string | null }[]) {
      if (row.metadata) {
        try {
          const meta = JSON.parse(row.metadata);
          if (meta.presetId) {
            if (!presetCounts[meta.presetId]) {
              presetCounts[meta.presetId] = { count: 0, name: meta.presetName };
            }
            presetCounts[meta.presetId].count += 1;
            if (meta.presetName && !presetCounts[meta.presetId].name) {
              presetCounts[meta.presetId].name = meta.presetName;
            }
          }
        } catch {
          // skip
        }
      }
    }

    const topPresets = Object.entries(presetCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([presetId, item]) => {
        const name = presetNames[presetId] || item.name || presetId;
        return { presetId, presetName: name, count: item.count };
      });

    // ── Average char count ────────────────────────────────────────────────────
    let totalChars = 0;
    let charSamples = 0;
    for (const row of sanitizeEvents as { metadata: string | null }[]) {
      if (row.metadata) {
        try {
          const meta = JSON.parse(row.metadata);
          if (typeof meta.charCount === 'number') {
            totalChars += meta.charCount;
            charSamples++;
          }
        } catch {
          // skip
        }
      }
    }
    const avgCharCount = charSamples > 0 ? Math.round(totalChars / charSamples) : 0;

    return NextResponse.json({
      summary,
      monthly: filledMonthly,
      topPresets,
      avgCharCount,
      range,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── Mock data for local dev (no D1) ──────────────────────────────────────────
function buildMockData(range: string) {
  const now = new Date();
  const monthly = [];

  if (range === '30d') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      monthly.push(
        { month, event_type: 'page_view', count: Math.floor(Math.random() * 50) + 10 },
        { month, event_type: 'sanitize', count: Math.floor(Math.random() * 30) + 5 },
        { month, event_type: 'feedback', count: Math.random() > 0.8 ? 1 : 0 }
      );
    }
  } else {
    const limit = range === '6m' ? 5 : 11;
    for (let i = limit; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly.push(
        { month, event_type: 'page_view', count: Math.floor(Math.random() * 400) + 50 },
        { month, event_type: 'sanitize', count: Math.floor(Math.random() * 200) + 20 },
        { month, event_type: 'feedback', count: Math.floor(Math.random() * 15) + 1 }
      );
    }
  }

  // Calculate mock summary based on range
  let summary = { page_view: 3240, sanitize: 1587, feedback: 42 };
  if (range === '30d') {
    summary = { page_view: 980, sanitize: 540, feedback: 5 };
  } else if (range === '6m') {
    summary = { page_view: 1850, sanitize: 920, feedback: 22 };
  }

  return {
    summary,
    monthly,
    topPresets: [
      { presetId: 'default01', presetName: 'ChatGPT → Normal', count: range === '30d' ? 240 : 823 },
      { presetId: 'default02', presetName: 'Fiverr Words', count: range === '30d' ? 120 : 412 },
      { presetId: 'custom-user-1', presetName: 'My Custom Preset', count: range === '30d' ? 55 : 187 },
    ],
    avgCharCount: range === '30d' ? 310 : 342,
    range,
  };
}
