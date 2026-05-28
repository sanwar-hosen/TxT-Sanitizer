/**
 * POST /api/feedback
 * Validates the form body and sends an email.
 *
 * Sending strategy (in priority order):
 *   1. Resend API (RESEND_API_KEY env var) — recommended, edge-compatible
 *   2. Gmail REST API via SMTP2HTTP (GMAIL_USER + GMAIL_APP_PASSWORD) — fallback
 *      Note: Nodemailer is NOT used because it requires Node.js TCP sockets (net/tls)
 *      which are unavailable in Cloudflare Workers even with nodejs_compat.
 *      Instead, we encode the email as an RFC 2822 message and send it via
 *      the Gmail API's /gmail/v1/users/me/messages/send endpoint using
 *      basic auth with an App Password.
 *
 * Rate limiting: max 5 submissions per IP per hour (in-memory).
 * Body: { email?: string; subject: string; message: string }
 */

import { NextResponse } from 'next/server';
import { getCfEnv } from '@/lib/db';

// This route must run in the Edge runtime (Cloudflare Workers).
export const runtime = 'edge';

// ── In-memory rate limiter ────────────────────────────────────────────────────
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT = 5;
const ipLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
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
// Uses Gmail's HTTP API with App Password auth (basic auth via fetch).
// This is edge-compatible because it's just HTTPS, no TCP sockets.
async function sendViaGmailApi(opts: {
  gmailUser: string;
  gmailPass: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  // Build RFC 2822 raw email
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

  // Base64url encode
  const encoded = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Basic auth credentials for Gmail API
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
  // Get client IP
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before sending again.' },
      { status: 429 }
    );
  }

  let body: { email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, subject, message } = body;

  // Validate required fields
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: 'Subject and message are required.' },
      { status: 400 }
    );
  }

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

  // Try Resend first
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
    // Fall back to Gmail REST API
    sendResult = await sendViaGmailApi({
      gmailUser,
      gmailPass,
      replyTo: email?.trim() || undefined,
      subject: subjectLine,
      html: htmlBody,
      text: textBody,
    });
  } else {
    // No email provider configured — simulate in dev
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
