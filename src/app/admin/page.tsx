'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminPresetManager from '@/components/admin/AdminPresetManager';
import AdminNotificationAlert from '@/components/admin/AdminNotificationAlert';
import AdminAboutEditor from '@/components/admin/AdminAboutEditor';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminAdsControl from '@/components/admin/AdminAdsControl';
import AdminEmailConfig from '@/components/admin/AdminEmailConfig';
import { Button } from '@/components/shared/Button';

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab =
  | 'presets'
  | 'notification'
  | 'about'
  | 'ads'
  | 'analytics'
  | 'email';

interface Preset {
  id: string;
  name: string;
  rules: { priority: number; find: string; replace: string }[];
  isDefault: boolean;
  version?: number;
}

interface AlertConfig {
  enabled: boolean;
  heading: string;
  hasLearnMore: boolean;
  body: string;
  version: number;
  updatedAt: string | null;
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'presets',
    label: 'Presets',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    id: 'notification',
    label: 'Alert',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    id: 'about',
    label: 'About Page',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'ads',
    label: 'Ads',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
];

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Invalid password');
        setPassword('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-dim)] px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-base-300 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-base-content">Admin Access</h1>
            <p className="text-xs text-base-content/50 mt-1.5">TxT Sanitizer dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-3 py-2.5 text-xs font-medium text-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-base-content/70 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                required
                className="w-full rounded-lg border border-base-300 bg-base-100 px-3.5 py-2.5 text-sm text-base-content placeholder-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full gap-2"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Authenticating…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-base-content/30 mt-4">
          Secured by environment variable · session valid 24h
        </p>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('presets');
  const [presets, setPresets] = useState<Preset[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    enabled: false,
    heading: '',
    hasLearnMore: false,
    body: '',
    version: 1,
    updatedAt: null,
  });
  const [aboutContent, setAboutContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if already authed (session cookie present)
  useEffect(() => {
    fetch('/api/admin/presets')
      .then((r) => {
        if (r.ok) setIsAuthed(true);
      })
      .catch(() => {})
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [presetsRes, alertRes, aboutRes] = await Promise.all([
        fetch('/api/admin/presets'),
        fetch('/api/admin/notification-alert'),
        fetch('/api/admin/about'),
      ]);

      if (presetsRes.ok) {
        const data = await presetsRes.json();
        setPresets(data.presets ?? []);
      }
      if (alertRes.ok) {
        const data = await alertRes.json();
        setAlertConfig(data);
      }
      if (aboutRes.ok) {
        const data = await aboutRes.json();
        setAboutContent(data.content ?? '');
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) fetchDashboardData();
  }, [isAuthed, fetchDashboardData]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthed(false);
  };

  // ── Auth check state ─────────────────────────────────────────────────────
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-dim)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthed) {
    return <LoginForm onSuccess={() => setIsAuthed(true)} />;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--surface-dim)]">
      {/* Dashboard header */}
      <div className="sticky top-14 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-base-content leading-none">Admin Dashboard</h1>
              <p className="text-[10px] text-base-content/40 mt-0.5">TxT Sanitizer v2</p>
            </div>
          </div>

          <Button
            variant="danger-outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-5 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="lg:w-52 shrink-0">
            <nav className="flex lg:flex-col gap-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 text-left w-full group ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                        : 'text-base-content/60 hover:bg-base-200 hover:text-base-content border border-transparent'
                    }`}
                  >
                    <span
                      className={`shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-base-content/40 group-hover:text-base-content/70'
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <span className="truncate">{tab.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {isLoading && activeTab !== 'analytics' ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-base-content/40">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <p className="text-sm">Loading dashboard data…</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                {/* Tab header */}
                <div className="flex items-center justify-between border-b border-base-300 px-6 py-4 bg-base-200/40">
                  <div className="flex items-center gap-2.5">
                    <span className="text-primary">
                      {TABS.find((t) => t.id === activeTab)?.icon}
                    </span>
                    <h2 className="text-base font-semibold text-base-content">
                      {TABS.find((t) => t.id === activeTab)?.label}
                    </h2>
                  </div>
                  {activeTab === 'presets' && (
                    <span className="text-xs text-base-content/40 font-mono">
                      {presets.length} preset{presets.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Tab body */}
                <div className="p-6">
                  {activeTab === 'presets' && (
                    <AdminPresetManager
                      presets={presets}
                      onRefresh={() => {
                        fetch('/api/admin/presets')
                          .then((r) => r.json())
                          .then((d) => setPresets(d.presets ?? []))
                          .catch(() => {});
                      }}
                    />
                  )}

                  {activeTab === 'notification' && (
                    <AdminNotificationAlert initialConfig={alertConfig} />
                  )}

                  {activeTab === 'about' && (
                    <AdminAboutEditor initialContent={aboutContent} />
                  )}

                  {activeTab === 'analytics' && <AdminAnalytics />}

                  {activeTab === 'ads' && (
                    <AdminAdsControl initialConfig={{ belowNavbar: false, sidebar: false }} />
                  )}

                  {activeTab === 'email' && <AdminEmailConfig />}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
