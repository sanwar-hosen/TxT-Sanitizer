'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/shared/Button';

interface AlertConfig {
  enabled: boolean;
  heading: string;
  hasLearnMore: boolean;
  body: string;
  version: number;
  updatedAt: string | null;
}

interface Props {
  initialConfig: AlertConfig;
}

export default function AdminNotificationAlert({ initialConfig }: Props) {
  const [config, setConfig] = useState<AlertConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  // Reset status after a few seconds
  useEffect(() => {
    if (saveStatus !== 'idle') {
      const t = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  const handleSave = useCallback(
    async (bumpVersion = false) => {
      if (!config.heading.trim()) {
        setSaveError('Heading is required.');
        setSaveStatus('error');
        return;
      }
      if (config.hasLearnMore && !config.body.trim()) {
        setSaveError('Body text is required when "Learn More" is enabled.');
        setSaveStatus('error');
        return;
      }

      setIsSaving(true);
      setSaveStatus('idle');
      setSaveError('');

      try {
        const res = await fetch('/api/admin/notification-alert', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enabled: config.enabled,
            heading: config.heading.trim(),
            hasLearnMore: config.hasLearnMore,
            bodyText: config.body,
            bumpVersion,
          }),
        });

        if (res.ok) {
          setSaveStatus('success');
          if (bumpVersion) {
            setConfig((c) => ({ ...c, version: c.version + 1 }));
          }
        } else {
          const data = await res.json();
          setSaveError(data.error ?? 'Failed to save.');
          setSaveStatus('error');
        }
      } catch {
        setSaveError('Network error. Please try again.');
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    },
    [config]
  );

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Alert configuration saved successfully.
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs font-medium text-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {saveError}
        </div>
      )}

      {/* Enabled toggle */}
      <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-base-content">Alert Banner</p>
          <p className="text-xs text-base-content/50 mt-0.5">Show a slide-in notification to all users</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center gap-3 select-none">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="checkbox checkbox-primary"
          />
          <span className="text-sm font-medium text-base-content">{config.enabled ? 'On' : 'Off'}</span>
        </label>
      </div>

      {/* Heading */}
      <div>
        <label className="block text-xs font-semibold text-base-content/70 mb-1.5">
          Heading <span className="text-error">*</span>
          <span className="ml-2 font-normal text-base-content/40">max 120 chars</span>
        </label>
        <input
          type="text"
          maxLength={120}
          value={config.heading}
          onChange={(e) => setConfig({ ...config, heading: e.target.value })}
          placeholder="e.g. New system presets available — update now!"
          className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content placeholder-base-content/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
        <p className="text-right text-[10px] text-base-content/30 mt-1">{config.heading.length}/120</p>
      </div>

      {/* Learn More toggle */}
      <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-5 py-4">
        <input
          type="checkbox"
          id="learn-more-toggle"
          checked={config.hasLearnMore}
          onChange={(e) => setConfig({ ...config, hasLearnMore: e.target.checked })}
          className="checkbox checkbox-primary"
        />
        <label htmlFor="learn-more-toggle" className="cursor-pointer select-none">
          <p className="text-sm font-semibold text-base-content">Show "Learn More" button</p>
          <p className="text-xs text-base-content/50 mt-0.5">Clicking it opens a modal with detailed body text</p>
        </label>
      </div>

      {/* Body text — conditionally shown */}
      {config.hasLearnMore && (
        <div>
          <label className="block text-xs font-semibold text-base-content/70 mb-1.5">
            Body Text <span className="text-error">*</span>
            <span className="ml-2 font-normal text-base-content/40">shown in the "Learn More" modal</span>
          </label>
          <textarea
            value={config.body}
            onChange={(e) => setConfig({ ...config, body: e.target.value })}
            placeholder="Write the full article-style detail here. Supports line breaks."
            rows={6}
            className="w-full resize-none rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content placeholder-base-content/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all custom-scrollbar"
          />
        </div>
      )}

      {/* Live Preview */}
      <div>
        <p className="text-xs font-semibold text-base-content/70 mb-2">Live Preview</p>
        <div
          className={`w-full rounded-2xl border px-5 py-3 flex items-center gap-3 transition-all duration-300 ${
            config.enabled
              ? 'border-primary/30 bg-base-200 shadow-sm'
              : 'border-base-300 bg-base-200/50 opacity-50'
          }`}
        >
          <span className="text-primary shrink-0">ⓘ</span>
          <p className="flex-1 text-sm font-semibold text-base-content truncate">
            {config.heading || <span className="italic text-base-content/30">Heading will appear here…</span>}
          </p>
          {config.hasLearnMore && (
            <button className="btn btn-primary btn-xs rounded-full shrink-0 pointer-events-none" tabIndex={-1}>
              Learn More
            </button>
          )}
          <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base-content/50 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {!config.enabled && (
          <p className="text-[10px] text-base-content/30 mt-1 text-center">Alert is currently disabled — enable it above</p>
        )}
      </div>

      {/* Version info + bump */}
      <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-base-content">Version</p>
          <p className="text-xs text-base-content/50 mt-0.5">
            Current: <span className="font-mono font-bold text-primary">v{config.version}</span>
            {' · '}Bumping version re-shows the alert to all users
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="gap-1.5 text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.2"/></svg>
          Re-show to All
        </Button>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => handleSave(false)} disabled={isSaving} className="gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {isSaving ? 'Saving…' : 'Save Alert Config'}
        </Button>
      </div>
    </div>
  );
}
