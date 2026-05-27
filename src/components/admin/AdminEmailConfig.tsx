'use client';

interface Props {
  gmailUser: string | null;
}

export default function AdminEmailConfig({ gmailUser }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-base-200/60 border border-base-300 px-4 py-3 text-xs text-base-content/60">
        Email configuration is set via environment variables and cannot be changed here. To update, modify <code className="font-mono">.env.local</code> (local) or the Cloudflare Pages environment variables (production).
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 divide-y divide-base-200">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-base-content">GMAIL_USER</p>
            <p className="text-xs text-base-content/50 mt-0.5">Sender address for feedback emails</p>
          </div>
          {gmailUser ? (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-mono font-medium text-base-content">{gmailUser}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-error/70" />
              <span className="text-sm font-medium text-error">Not configured</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-base-content">GMAIL_APP_PASSWORD</p>
            <p className="text-xs text-base-content/50 mt-0.5">Gmail App Password for SMTP authentication</p>
          </div>
          {gmailUser ? (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-mono font-medium text-base-content/60">••••••••••••••••</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-error/70" />
              <span className="text-sm font-medium text-error">Not configured</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-base-content">Feedback Email Status</p>
            <p className="text-xs text-base-content/50 mt-0.5">Whether the feedback form can send emails</p>
          </div>
          {gmailUser ? (
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">Operational</span>
          ) : (
            <span className="rounded-full bg-error/10 px-3 py-1 text-xs font-bold text-error">Inactive</span>
          )}
        </div>
      </div>

      {!gmailUser && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
          <strong>Setup required:</strong> Add <code className="font-mono">GMAIL_USER</code> and <code className="font-mono">GMAIL_APP_PASSWORD</code> to your environment variables. See the implementation plan §2.4 for instructions.
        </div>
      )}
    </div>
  );
}
