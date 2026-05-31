/**
 * POST /api/feedback
 * Validates the form body and sends an email via Resend API.
 *
 * Sending strategy:
 *   Resend API (RESEND_API_KEY env var) — edge-compatible, recommended.
 *   Configure these in Cloudflare Pages environment variables:
 *     RESEND_API_KEY   — your Resend API key
 *     FEEDBACK_EMAIL   — the inbox that receives feedback (e.g. you@gmail.com)
 *                        Falls back to GMAIL_USER if FEEDBACK_EMAIL is not set.
 *
 * NOTE: The Gmail REST API fallback was removed. It required OAuth2 Bearer tokens
 * which are not practical for a server-side secrets setup. Use Resend instead.
 *
 * Rate limiting: 1 submission per IP per 24 hours, persisted in D1.
 * Falls back to in-memory limiting when D1 is unavailable (local dev).
 *
 * Body: { email?: string; subject: string; message: string }
 */

import { NextResponse } from 'next/server';
import { getCfEnv, getDB } from '@/lib/db';

export const runtime = 'edge';

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Fallback in-memory limiter (local dev only) ────────────────────────────────
const memoryLog = new Map<string, number>();

// ── D1-backed rate limiter ─────────────────────────────────────────────────────
/**
 * Creates the rate-limit table if it doesn't exist, then checks whether the
 * given IP is within the 24-hour cooldown.
 *
 * Returns: { limited: false } | { limited: true; retryAfterMs: number }
 */
async function checkRateLimit(
  ip: string
): Promise<{ limited: false } | { limited: true; retryAfterMs: number }> {
  const db = getDB();

  if (!db) {
    // Local dev — use in-memory fallback
    const lastSent = memoryLog.get(ip);
    const now = Date.now();
    if (lastSent && now - lastSent < COOLDOWN_MS) {
      return { limited: true, retryAfterMs: COOLDOWN_MS - (now - lastSent) };
    }
    memoryLog.set(ip, now);
    return { limited: false };
  }

  // Ensure table exists (idempotent)
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS feedback_rate_limit (
        ip TEXT PRIMARY KEY,
        last_sent_at INTEGER NOT NULL
      )`
    )
    .run();

  const now = Date.now();
  const row = await db
    .prepare('SELECT last_sent_at FROM feedback_rate_limit WHERE ip = ?')
    .bind(ip)
    .first<{ last_sent_at: number }>();

  if (row && now - row.last_sent_at < COOLDOWN_MS) {
    return { limited: true, retryAfterMs: COOLDOWN_MS - (now - row.last_sent_at) };
  }

  // Upsert the timestamp
  await db
    .prepare(
      `INSERT INTO feedback_rate_limit (ip, last_sent_at)
       VALUES (?, ?)
       ON CONFLICT(ip) DO UPDATE SET last_sent_at = excluded.last_sent_at`
    )
    .bind(ip, now)
    .run();

  return { limited: false };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Formats milliseconds into a human-readable "Xh Ym" string. */
function formatCooldown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.ceil((totalSeconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

// ── Send via Resend API ────────────────────────────────────────────────────────
async function sendViaResend(opts: {
  resendApiKey: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const body: Record<string, unknown> = {
    from: 'TxT Sanitizer Feedback <onboarding@resend.dev>',
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  };
  if (opts.replyTo) body.reply_to = opts.replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.resendApiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error');
    return { ok: false, error: `Resend API error (${res.status}): ${err}` };
  }
  return { ok: true };
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  // ── Rate limit check ──────────────────────────────────────────────────────
  const rateLimit = await checkRateLimit(ip);
  if (rateLimit.limited) {
    const retryIn = formatCooldown(rateLimit.retryAfterMs);
    return NextResponse.json(
      {
        error: `You've already sent feedback today. Please try again in ${retryIn}.`,
        retryAfterMs: rateLimit.retryAfterMs,
      },
      { status: 429 }
    );
  }

  // ── Body validation ───────────────────────────────────────────────────────
  let body: { email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, subject, message } = body;

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: 'Subject and message are required.' },
      { status: 400 }
    );
  }

  // ── Resolve recipient & sender credentials ────────────────────────────────
  const resendApiKey = getCfEnv('RESEND_API_KEY' as keyof CloudflareEnv);
  // FEEDBACK_EMAIL is the preferred recipient; fall back to GMAIL_USER
  const recipientEmail =
    getCfEnv('FEEDBACK_EMAIL' as keyof CloudflareEnv) ??
    getCfEnv('GMAIL_USER' as keyof CloudflareEnv);

  const subjectLine = `[TxT Sanitizer Feedback] ${subject.trim().slice(0, 200)}`;
  const textBody = [
    `From: ${email?.trim() || 'Anonymous'}`,
    `Subject: ${subject.trim()}`,
    '',
    message.trim(),
  ].join('\n');
  const htmlBody = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px;">
      <h2 style="color: #004AAD; margin-bottom: 4px;">New Feedback</h2>
      <p style="color: #666; font-size: 13px; margin-top: 0;">From: <strong>${email?.trim() || 'Anonymous'}</strong></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
      <p style="white-space: pre-wrap; color: #1a1a1a;">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>
  `;

  // ── Email sending ─────────────────────────────────────────────────────────
  let sendResult: { ok: boolean; error?: string };

  if (resendApiKey && recipientEmail) {
    sendResult = await sendViaResend({
      resendApiKey,
      to: recipientEmail,
      replyTo: email?.trim() || undefined,
      subject: subjectLine,
      html: htmlBody,
      text: textBody,
    });
  } else {
    // Local dev / unconfigured: simulate a successful send so the UI works.
    // In production, set RESEND_API_KEY + FEEDBACK_EMAIL in Cloudflare Pages env vars.
    console.warn(
      '[feedback] No email provider configured — simulating send. ' +
      'Set RESEND_API_KEY and FEEDBACK_EMAIL in Cloudflare Pages environment variables.'
    );
    sendResult = { ok: true };
  }

  if (!sendResult.ok) {
    console.error('[feedback] Failed to send email:', sendResult.error);
    return NextResponse.json(
      { error: 'Failed to send feedback. Please try again later.' },
      { status: 500 }
    );
  }

  // Log analytics event — directly to D1 if available, fallback to awaiting fetch
  const db = getDB();
  if (db) {
    try {
      await db
        .prepare('INSERT INTO analytics (event_type) VALUES (?)')
        .bind('feedback')
        .run();
    } catch (err) {
      console.error('[feedback] Failed to log feedback analytics to D1:', err);
    }
  } else {
    try {
      await fetch(new URL('/api/analytics', request.url), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event_type: 'feedback' }),
      });
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ ok: true });
}
