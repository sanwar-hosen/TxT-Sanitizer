'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import type { SearchMatch } from '@/hooks/useFindReplace';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSanitize: () => void;
  isSanitizing?: boolean;
  frMatches?: SearchMatch[];
  frActiveIndex?: number;
}

export default function InputPanel({ value, onChange, onSanitize, isSanitizing, frMatches = [], frActiveIndex = -1 }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = value.trim().length === 0;

  // Ctrl+Enter → sanitize
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isEmpty) onSanitize();
      }
    },
    [isEmpty, onSanitize]
  );

  // Paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
      // Focus textarea after paste
      textareaRef.current?.focus();
    } catch {
      // Clipboard API not available — silently ignore
    }
  }, [onChange]);

  const backdropRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Build segments locally for search highlights
  const searchSegments = useMemo(() => {
    if (frMatches.length === 0) return [{ text: value, isMatch: false, isActive: false }];
    
    const segments: { text: string; isMatch: boolean; isActive: boolean }[] = [];
    let cursor = 0;
    
    frMatches.forEach((match, i) => {
      if (match.startIndex > cursor) {
        segments.push({
          text: value.slice(cursor, match.startIndex),
          isMatch: false,
          isActive: false,
        });
      }
      segments.push({
        text: value.slice(match.startIndex, match.endIndex),
        isMatch: true,
        isActive: i === frActiveIndex,
      });
      cursor = match.endIndex;
    });
    
    if (cursor < value.length) {
      segments.push({
        text: value.slice(cursor),
        isMatch: false,
        isActive: false,
      });
    }
    
    return segments;
  }, [value, frMatches, frActiveIndex]);

  return (
    <section
      className="flex-1 flex flex-col relative border-r border-outline-variant dark:border-[var(--border)]"
      data-purpose="input-pane"
    >
      {/* Clear button — top-right */}
      {!isEmpty && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={() => {
              onChange('');
              textareaRef.current?.focus();
            }}
            title="Clear input"
            className="p-1.5 border border-outline-variant dark:border-[var(--border)] rounded-md bg-white dark:bg-[var(--surface-2)] text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 hover:border-red-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Editor Area with Highlights Backdrop */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Backdrop */}
        <div
          ref={backdropRef}
          className="absolute inset-0 p-4 font-mono text-sm whitespace-pre-wrap break-words text-transparent pointer-events-none overflow-auto custom-scrollbar pane-textarea"
          aria-hidden="true"
        >
          {searchSegments.map((seg, i) => {
            if (seg.isMatch) {
              return (
                <span
                  key={i}
                  className={[
                    seg.isActive ? 'bg-blue-400/50 dark:bg-blue-500/50 text-transparent font-medium' : 'bg-blue-200/50 dark:bg-blue-800/40 text-transparent',
                    'rounded-[2px] transition-colors py-[1px] -my-[1px]'
                  ].join(' ')}
                >
                  {seg.text}
                </span>
              );
            }
            return <span key={i}>{seg.text}</span>;
          })}
          {/* We must add extra padding space to allow identical scrolling */}
        </div>
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="input-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full p-4 font-mono text-sm resize-none border-none pane-textarea custom-scrollbar text-textMain dark:text-[var(--text)] placeholder-textMuted dark:placeholder-[var(--text-muted)] bg-transparent"
          placeholder="Paste or type text here…"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* Bottom-right actions */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {/* Paste button */}
        <button
          id="btn-paste"
          title="Paste from clipboard"
          onClick={handlePaste}
          className="p-2 border border-outline-variant dark:border-[var(--border)] rounded-md bg-white dark:bg-[var(--surface-2)] text-slate-500 dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-700 hover:text-primary dark:hover:text-blue-400 hover:border-primary/30 dark:hover:border-blue-400/30 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <rect height="4" rx="1" ry="1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="8" x="8" y="2" />
          </svg>
        </button>

        {/* Sanitize button — hidden when empty, dims while typing */}
        {!isEmpty && (
          <button
            id="btn-sanitize"
            onClick={onSanitize}
            disabled={isSanitizing}
            title="Sanitize (Ctrl+Enter)"
            style={{ 
              backgroundColor: '#004AAD',
              color: 'white'
            }}
            className={[
              'px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 shadow-sm',
              'hover:brightness-90 hover:shadow-md hover:scale-105 active:scale-95',
              isSanitizing ? 'opacity-60 cursor-not-allowed' : 'opacity-100',
            ].join(' ')}
          >
            Sanitize
          </button>
        )}
      </div>
    </section>
  );
}
