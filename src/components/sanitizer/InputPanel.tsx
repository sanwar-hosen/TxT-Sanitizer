'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import type { SearchMatch } from '@/hooks/useFindReplace';
import type { Match } from '@/types/preset';
import { Button } from '@/components/shared/Button';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSanitize: () => void;
  isSanitizing?: boolean;
  frMatches?: SearchMatch[];
  frActiveIndex?: number;
  manualSanitize?: boolean;
  presetMatches?: Match[];
}

export default function InputPanel({
  value,
  onChange,
  onSanitize,
  isSanitizing,
  frMatches = [],
  frActiveIndex = -1,
  manualSanitize = true,
  presetMatches = [],
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

  // Build segments locally for backdrop highlights
  const unifiedSegments = useMemo(() => {
    if (frMatches.length === 0 && presetMatches.length === 0) {
      return [{ text: value, isFRMatch: false, isActiveFR: false, isPresetMatch: false }];
    }

    const frIntervals = frMatches.map((m, idx) => ({
      start: m.startIndex,
      end: m.endIndex,
      isActive: idx === frActiveIndex,
    }));

    const presetIntervals = presetMatches
      .filter((m) => m.inputStartIndex !== undefined && m.inputEndIndex !== undefined)
      .map((m) => ({
        start: m.inputStartIndex!,
        end: m.inputEndIndex!,
      }));

    const boundaries = new Set<number>([0, value.length]);
    frIntervals.forEach((i) => {
      boundaries.add(i.start);
      boundaries.add(i.end);
    });
    presetIntervals.forEach((i) => {
      boundaries.add(i.start);
      boundaries.add(i.end);
    });

    const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

    const segments: {
      text: string;
      isFRMatch: boolean;
      isActiveFR: boolean;
      isPresetMatch: boolean;
    }[] = [];

    for (let idx = 0; idx < sortedBoundaries.length - 1; idx++) {
      const start = sortedBoundaries[idx];
      const end = sortedBoundaries[idx + 1];
      const segmentText = value.slice(start, end);
      if (!segmentText) continue;

      const frMatch = frIntervals.find((i) => start >= i.start && end <= i.end);
      const presetMatch = presetIntervals.find((i) => start >= i.start && end <= i.end);

      segments.push({
        text: segmentText,
        isFRMatch: !!frMatch,
        isActiveFR: frMatch?.isActive ?? false,
        isPresetMatch: !!presetMatch,
      });
    }

    return segments;
  }, [value, frMatches, frActiveIndex, presetMatches]);

  return (
    <section
      className="flex-1 flex flex-col relative border-b md:border-b-0 md:border-r border-outline-variant dark:border-[var(--border)] min-h-0 min-w-0 overflow-hidden"
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
            className="flex items-center justify-center w-7 h-7 rounded-[4px] text-on-surface-variant dark:text-[var(--text-muted)] border border-outline-variant dark:border-[var(--border)] hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-400 dark:hover:border-red-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Clear input"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
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
          {unifiedSegments.map((seg, i) => {
            if (seg.isFRMatch) {
              return (
                <span
                  key={i}
                  className={[
                    seg.isActiveFR
                      ? 'bg-blue-400/50 dark:bg-blue-500/50 text-transparent font-medium'
                      : 'bg-blue-200/50 dark:bg-blue-800/40 text-transparent',
                    'rounded-[2px] transition-colors py-[1px] -my-[1px]'
                  ].join(' ')}
                >
                  {seg.text}
                </span>
              );
            }
            if (seg.isPresetMatch) {
              return (
                <span
                  key={i}
                  className="bg-amber-200 dark:bg-amber-800/40 text-transparent rounded-[2px] transition-colors py-[1px] -my-[1px]"
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
          size="sm"
          className="btn-square min-w-0"
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
            size="sm"
          >
            Sanitize
          </Button>
        )}
      </div>
    </section>
  );
}
