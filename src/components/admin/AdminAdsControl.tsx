'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/shared/Button';

interface AdsConfig {
  belowNavbar: boolean;
  sidebar: boolean;
}

interface Props {
  initialConfig: AdsConfig;
}

export default function AdminAdsControl({ initialConfig }: Props) {
  const [config, setConfig] = useState<AdsConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (saveStatus !== 'idle') {
      const t = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaveStatus(res.ok ? 'success' : 'error');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  return (
    <div className="space-y-5">
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Ad slot configuration saved.
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs font-medium text-error">
          Failed to save. Please try again.
        </div>
      )}

      <div className="rounded-lg bg-base-200/60 border border-base-300 px-4 py-3 text-xs text-base-content/60">
        <strong className="text-base-content">Note:</strong> Ad slots are reserved <code className="font-mono">&lt;div&gt;</code> containers built into the layout. Toggling them on makes the container visible and ready for ad code insertion. Toggling off hides the container entirely (no layout shift).
      </div>

      <div className="space-y-3">
        {/* Below navbar slot */}
        <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 px-5 py-4 hover:border-primary/20 transition-all">
          <div>
            <p className="text-sm font-semibold text-base-content">Below Navbar Slot</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              Horizontal banner below the main navigation bar
              {' · '}<code className="font-mono text-base-content/40">id="ad-below-navbar"</code>
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-3 select-none">
            <input
              type="checkbox"
              checked={config.belowNavbar}
              onChange={(e) => setConfig({ ...config, belowNavbar: e.target.checked })}
              className="checkbox checkbox-primary"
            />
            <span className={`text-sm font-medium ${config.belowNavbar ? 'text-primary' : 'text-base-content/50'}`}>
              {config.belowNavbar ? 'Visible' : 'Hidden'}
            </span>
          </label>
        </div>

        {/* Sidebar slot */}
        <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 px-5 py-4 hover:border-primary/20 transition-all">
          <div>
            <p className="text-sm font-semibold text-base-content">Right Sidebar Slot</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              Vertical banner in the right sidebar area
              {' · '}<code className="font-mono text-base-content/40">id="ad-sidebar"</code>
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-3 select-none">
            <input
              type="checkbox"
              checked={config.sidebar}
              onChange={(e) => setConfig({ ...config, sidebar: e.target.checked })}
              className="checkbox checkbox-primary"
            />
            <span className={`text-sm font-medium ${config.sidebar ? 'text-primary' : 'text-base-content/50'}`}>
              {config.sidebar ? 'Visible' : 'Hidden'}
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} disabled={isSaving} className="gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {isSaving ? 'Saving…' : 'Save Ad Config'}
        </Button>
      </div>
    </div>
  );
}
