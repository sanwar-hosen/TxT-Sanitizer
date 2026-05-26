'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import type { SearchMatch } from '@/hooks/useFindReplace';
import { Button } from '@/components/shared/Button';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSanitize: () => void;
  isSanitizing?: boolean;
  frMatches?: SearchMatch[];
  frActiveIndex?: number;
  manualSanitize?: boolean;
}

export default function InputPanel({
  value,
  onChange,
  onSanitize,
  isSanitizing,
  frMatches = [],
  frActiveIndex = -1,
  manualSanitize = true,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = value.trim().length === 0;

  // Ctrl+Enter → sanitize
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isEmpty && manualSanitize) onSanitize();
      }
    },
    [isEmpty, onSanitize, manualSanitize]
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
          <Button
            variant="danger-outline"
            size="sm"
            onClick={() => {
              onChange('');
              textareaRef.current?.focus();
            }}
            title="Clear input"
            className="p-1.5 min-w-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
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
        <Button
          id="btn-paste"
          title="Paste from clipboard"
          onClick={handlePaste}
          variant="secondary"
          className="p-2 min-w-0"
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
        </Button>

        {/* Sanitize button — hidden when empty or in auto mode */}
        {!isEmpty && manualSanitize && (
          <Button
            id="btn-sanitize"
            onClick={onSanitize}
            disabled={isSanitizing}
            title="Sanitize (Ctrl+Enter)"
            variant="primary"
          >
            Sanitize
          </Button>
        )}
      </div>
    </section>
  );
}
