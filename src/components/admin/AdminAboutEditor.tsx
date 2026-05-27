'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/shared/Button';

interface Props {
  initialContent: string;
}

export default function AdminAboutEditor({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (saveStatus !== 'idle') {
      const t = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setSaveError('');
    try {
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setSaveStatus('success');
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
  }, [content]);

  return (
    <div className="space-y-5">
      {/* Status */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          About page content saved successfully.
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs font-medium text-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {saveError}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-xs text-primary/80">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        <span>Enter HTML content for the About page. Use semantic tags like <code className="font-mono">&lt;h2&gt;</code>, <code className="font-mono">&lt;p&gt;</code>, <code className="font-mono">&lt;ul&gt;</code>. Content is stored in D1 and served via SSR for SEO.</span>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-lg border border-base-300 bg-base-200/50 p-1 w-fit">
        {(['edit', 'preview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
              tab === t
                ? 'bg-base-100 text-base-content shadow-sm'
                : 'text-base-content/50 hover:text-base-content'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Editor */}
      {tab === 'edit' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="<h2>About TxT Sanitizer</h2>
<p>TxT Sanitizer is a free, browser-based tool...</p>"
          rows={18}
          className="w-full resize-none rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm font-mono text-base-content placeholder-base-content/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all custom-scrollbar"
        />
      ) : (
        <div
          className="min-h-64 rounded-xl border border-base-300 bg-base-100 px-6 py-5 prose prose-sm dark:prose-invert max-w-none text-base-content overflow-auto custom-scrollbar"
          dangerouslySetInnerHTML={{ __html: content || '<p class="text-base-content/30 italic">Nothing to preview…</p>' }}
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-base-content/40">
          {content.length} chars · stored in D1 · served via SSR for SEO
        </span>
        <Button variant="primary" onClick={handleSave} disabled={isSaving} className="gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {isSaving ? 'Saving…' : 'Publish Changes'}
        </Button>
      </div>
    </div>
  );
}
