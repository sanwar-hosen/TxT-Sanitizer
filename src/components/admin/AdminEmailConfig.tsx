'use client';

import { useState, useEffect } from 'react';

interface EmailStatus {
  configured: boolean;
  provider: 'resend' | 'gmail' | null;
  displayEmail: string | null;
  resendConfigured: boolean;
  gmailConfigured: boolean;
}

export default function AdminEmailConfig() {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/email-status')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load email status');
        return r.json();
      })
      .then((data) => setStatus(data))
      .catch(() => setError('Failed to load email configuration status.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
        {error}
      </div>
    );
  }

  const providerLabel =
    status?.provider === 'resend'
      ? 'Resend API'
      : status?.provider === 'gmail'
      ? 'Gmail SMTP (REST)'
      : null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-base-200/60 border border-base-300 px-4 py-3 text-xs text-base-content/60">
        Email configuration is set via environment variables and cannot be changed here. To update,
        modify <code className="font-mono">.env.local</code> (local) or the Cloudflare Pages
        environment variables (production).
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 divide-y divide-base-200">
        {/* RESEND_API_KEY */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-base-content">RESEND_API_KEY</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              Resend API key — recommended for Cloudflare Pages
            </p>
          </div>
          {status?.resendConfigured ? (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-mono font-medium text-base-content/60">
                ••••••••••••••••
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-base-content/20" />
              <span className="text-sm font-medium text-base-content/40">Not set</span>
            </div>
          )}
        </div>

        {/* GMAIL_USER */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-base-content">GMAIL_USER</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              Gmail address — used as the feedback recipient
            </p>
          </div>
          {status?.gmailConfigured ? (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-mono font-medium text-base-content">
                {status.displayEmail ?? '(set)'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-error/70" />
              <span className="text-sm font-medium text-error">Not configured</span>
            </div>
          )}
        </div>

        {/* GMAIL_APP_PASSWORD */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-base-content">GMAIL_APP_PASSWORD</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              Gmail App Password — used as the fallback sender
            </p>
          </div>
          {status?.gmailConfigured ? (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-mono font-medium text-base-content/60">
                ••••••••••••••••
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-error/70" />
              <span className="text-sm font-medium text-error">Not configured</span>
            </div>
          )}
        </div>

        {/* Active provider + status */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-base-content">Feedback Email Status</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              {providerLabel ? `Active provider: ${providerLabel}` : 'No email provider configured'}
            </p>
          </div>
          {status?.configured ? (
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Operational
            </span>
          ) : (
            <span className="rounded-full bg-error/10 px-3 py-1 text-xs font-bold text-error">
              Inactive
            </span>
          )}
        </div>
      </div>

      {!status?.configured && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3 text-xs text-amber-700 dark:text-amber-400 space-y-2">
          <p>
            <strong>Setup required:</strong> To enable feedback emails, add one of the following to
            your Cloudflare Pages environment variables:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>
              <code className="font-mono">RESEND_API_KEY</code> — Recommended. Free account at{' '}
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                resend.com
              </a>
              . 100 emails/day free.
            </li>
            <li>
              <code className="font-mono">GMAIL_USER</code> +{' '}
              <code className="font-mono">GMAIL_APP_PASSWORD</code> — Gmail fallback (limited
              deliverability on Cloudflare Edge).
            </li>
          </ul>
        </div>
      )}

      {status?.configured && !status.resendConfigured && status.gmailConfigured && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 px-4 py-3 text-xs text-blue-700 dark:text-blue-400">
          <strong>Tip:</strong> You&apos;re using Gmail as a fallback. For better deliverability on
          Cloudflare Pages, consider adding a{' '}
          <code className="font-mono">RESEND_API_KEY</code> from{' '}
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            resend.com
          </a>{' '}
          (free tier: 100 emails/day).
        </div>
      )}
    </div>
  );
}
