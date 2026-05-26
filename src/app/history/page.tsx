'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useHistory } from '@/hooks/useHistory';
import Modal from '@/components/shared/Modal';

type SortMode = 'newest' | 'oldest';

/** Format an ISO date string to a readable display */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/** Truncate text for preview */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

/* ── Shared button style tokens ────────────────────────────────────────────── */
const BTN_BASE = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200';
const BTN_GHOST = `${BTN_BASE} text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:shadow-md hover:scale-105 active:scale-95 border border-outline-variant`;
const BTN_DANGER = `${BTN_BASE} text-slate-400 border border-outline-variant hover:bg-red-50 hover:text-red-500 hover:border-red-400 hover:shadow-md hover:scale-105 active:scale-95`;

export default function HistoryPage() {
  const { history, deleteEntry, clearAll } = useHistory();
  const router = useRouter();

  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Sorted history
  const sorted = useMemo(() => {
    const items = [...history];
    if (sortMode === 'oldest') items.reverse();
    return items;
  }, [history, sortMode]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  /** Send history entry back to workspace as input */
  const handleEditToWorkspace = useCallback(
    (inputText: string) => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('txts_v2_editFromHistory', inputText);
      }
      router.push('/');
    },
    [router]
  );

  const handleClearAll = useCallback(() => {
    clearAll();
    setShowClearModal(false);
    setExpandedIds(new Set());
  }, [clearAll]);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8">
      <div className="max-w-[1000px] w-full mx-auto">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
              title="Back to Sanitizer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7M19 12H5" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-on-surface">History</h1>
            <span className="text-xs font-medium text-on-surface-variant bg-surface-container-high rounded-full px-2.5 py-0.5">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort toggle */}
            <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-outline-variant">
              <button
                onClick={() => setSortMode('newest')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                  sortMode === 'newest'
                    ? 'bg-primary text-on-primary shadow-[0_2px_8px_rgba(0,74,173,0.35)] scale-[1.02]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortMode('oldest')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                  sortMode === 'oldest'
                    ? 'bg-primary text-on-primary shadow-[0_2px_8px_rgba(0,74,173,0.35)] scale-[1.02]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Oldest
              </button>
            </div>

            {/* Clear all button — alert themed */}
            {history.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className={BTN_DANGER}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ── Empty State ───────────────────────────────────────────────── */}
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l4 2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-on-surface mb-1">No history yet</h2>
            <p className="text-sm text-on-surface-variant max-w-xs">
              Your sanitization history will appear here after you run the sanitizer.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-transparent hover:bg-primary/10 hover:border-primary/30 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Go to Sanitizer
            </button>
          </div>
        )}

        {/* ── History Entries ────────────────────────────────────────────── */}
        <div className="space-y-3">
          {sorted.map((entry) => {
            const isExpanded = expandedIds.has(entry.id);
            const isCopied = copiedId === entry.id;

            return (
              <div
                key={entry.id}
                className="group bg-white dark:bg-[var(--surface)] rounded-xl border border-outline-variant dark:border-[var(--border)] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* ── Header Row ──────────────────────────────────────── */}
                <div
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(entry.id)}
                >
                  {/* Expand chevron */}
                  <button className="mt-0.5 flex items-center justify-center w-5 h-5 rounded text-on-surface-variant transition-transform duration-200"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  {/* Content preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-md">
                        {entry.presetName}
                      </span>
                      {entry.matchCount > 0 && (
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          {entry.matchCount} match{entry.matchCount !== 1 ? 'es' : ''}
                        </span>
                      )}
                      <span className="text-[10px] text-on-surface-variant ml-auto flex-shrink-0">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface leading-snug font-mono">
                      {truncate(entry.inputText, 120)}
                    </p>
                  </div>
                </div>

                {/* ── Expanded Content ─────────────────────────────────── */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-outline-variant/50 bg-surface-container-low/30"
                    style={{ animation: 'modalSlideUp 0.15s ease-out' }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {/* Input */}
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1.5">Input</div>
                        <div className="bg-white dark:bg-[var(--surface-2)] rounded-lg border border-outline-variant dark:border-[var(--border)] p-3 text-sm font-mono text-on-surface whitespace-pre-wrap break-words max-h-48 overflow-y-auto custom-scrollbar">
                          {entry.inputText}
                        </div>
                      </div>

                      {/* Output */}
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1.5">Output</div>
                        <div className="bg-white dark:bg-[var(--surface-2)] rounded-lg border border-outline-variant dark:border-[var(--border)] p-3 text-sm font-mono text-on-surface whitespace-pre-wrap break-words max-h-48 overflow-y-auto custom-scrollbar">
                          {entry.outputText}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/30">
                      {/* Copy output */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(entry.outputText, entry.id);
                        }}
                        className={BTN_GHOST}
                      >
                        {isCopied ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            Copy Output
                          </>
                        )}
                      </button>

                      {/* Edit to workspace */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditToWorkspace(entry.inputText);
                        }}
                        className={`${BTN_BASE} text-on-surface-variant border border-outline-variant hover:bg-primary/10 hover:text-primary hover:border-primary/30 hover:shadow-md hover:scale-105 active:scale-95`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                        Edit in Workspace
                      </button>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Delete — alert themed */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className={BTN_DANGER}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Clear All Confirmation Modal — alert themed ───────────────── */}
      <Modal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All History"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowClearModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:shadow-sm hover:scale-105 active:scale-95 border border-outline-variant transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 border border-outline-variant hover:bg-red-50 hover:text-red-500 hover:border-red-400 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Clear All
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            This will permanently delete all <strong className="text-on-surface">{history.length}</strong> history{' '}
            {history.length === 1 ? 'entry' : 'entries'}. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
