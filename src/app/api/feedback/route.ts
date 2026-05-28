/**
 * POST /api/feedback
 * Validates the form body and sends an email.
 *
 * Sending strategy (in priority order):
 *   1. Resend API (RESEND_API_KEY env var) — recommended, edge-compatible
 *   2. Gmail REST API (GMAIL_USER + GMAIL_APP_PASSWORD) — fallback
 *      Note: Nodemailer is NOT used; it requires Node.js TCP sockets unavailable on Edge.
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
    return { ok: false, error: err };
  }
  return { ok: true };
}

// ── Send via Gmail REST API ────────────────────────────────────────────────────
async function sendViaGmailApi(opts: {
  gmailUser: string;
  gmailPass: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const boundary = `boundary_${Date.now()}`;
  const rawEmail = [
    `From: "TxT Sanitizer Feedback" <${opts.gmailUser}>`,
    `To: ${opts.gmailUser}`,
    opts.replyTo ? `Reply-To: ${opts.replyTo}` : '',
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    opts.text,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    opts.html,
    '',
    `--${boundary}--`,
  ]
    .filter((line) => line !== null)
    .join('\r\n');

  const encoded = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const credentials = btoa(`${opts.gmailUser}:${opts.gmailPass}`);

  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    }
  );

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error');
    return { ok: false, error: err };
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

  // ── Email sending ─────────────────────────────────────────────────────────
  const resendApiKey = getCfEnv('RESEND_API_KEY' as keyof CloudflareEnv);
  const gmailUser = getCfEnv('GMAIL_USER');
  const gmailPass = getCfEnv('GMAIL_APP_PASSWORD');

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

  let sendResult: { ok: boolean; error?: string } = {
    ok: false,
    error: 'No email provider configured.',
  };

  if (resendApiKey) {
    sendResult = await sendViaResend({
      resendApiKey,
      to: gmailUser ?? 'feedback@example.com',
      replyTo: email?.trim() || undefined,
      subject: subjectLine,
      html: htmlBody,
      text: textBody,
    });
  } else if (gmailUser && gmailPass) {
    sendResult = await sendViaGmailApi({
      gmailUser,
      gmailPass,
      replyTo: email?.trim() || undefined,
      subject: subjectLine,
      html: htmlBody,
      text: textBody,
    });
  } else {
    console.warn('[feedback] No email provider configured — simulating send');
    sendResult = { ok: true };
  }

  if (!sendResult.ok) {
    console.error('[feedback] Failed to send email:', sendResult.error);
    return NextResponse.json(
      { error: 'Failed to send feedback. Please try again later.' },
      { status: 500 }
    );
  }

  // Log analytics event (fire-and-forget)
  try {
    await fetch(new URL('/api/analytics', request.url), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event_type: 'feedback' }),
    });
  } catch {
    // Non-critical
  }

  return NextResponse.json({ ok: true });
}
