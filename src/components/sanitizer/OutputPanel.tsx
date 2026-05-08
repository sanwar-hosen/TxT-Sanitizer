'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import type { Match } from '@/types/preset';
import { buildHighlightSegments } from '@/lib/highlight';
import type { useFindReplace } from '@/hooks/useFindReplace';
import FindReplacePanel from './FindReplacePanel';

interface Props {
  value: string;
  matches: Match[];
  onCopy: () => void;
  onReinput: () => void;
  onRestoreMatch: (match: Match) => void;
  copied?: boolean;
  fr?: ReturnType<typeof useFindReplace>;
  onReplaceOne?: () => void;
  onReplaceAll?: () => void;
}

export default function OutputPanel({
  value,
  matches,
  onCopy,
  onReinput,
  onRestoreMatch,
  copied = false,
  fr,
  onReplaceOne,
  onReplaceAll,
}: Props) {
  const matchCount = matches.length;
  const isEmpty = value.length === 0;

  const segments = buildHighlightSegments(value, matches);

  const [hoveredMatch, setHoveredMatch] = useState<Match | null>(null);
  const [btnPos, setBtnPos] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>, match: Match) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setBtnPos({ top: rect.bottom + 4, left: rect.left });
    setHoveredMatch(match);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMatch(null);
    }, 300);
  }, []);

  const handleBtnMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handleBtnMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMatch(null);
    }, 300);
  }, []);

  // Keyboard shortcut Ctrl+Shift+F
  useEffect(() => {
    if (!fr) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        fr.toggleOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fr]);

  return (
    <section
      className="flex-1 flex flex-col relative"
      data-purpose="output-pane"
    >
      {fr && (
        <div className="absolute top-3 right-3 z-10">
          <button
            id="btn-find-replace"
            onClick={fr.toggleOpen}
            title="Find & Replace (Ctrl+Shift+F)"
            className={`p-1.5 border rounded-md transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95 ${
              fr.isOpen 
                ? 'bg-primary border-primary text-white' 
                : 'border-outline-variant bg-white text-slate-500 hover:bg-surface-container-low hover:text-primary hover:border-primary/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      )}

      {fr && (
        <FindReplacePanel
          isOpen={fr.isOpen}
          onClose={fr.close}
          query={fr.query}
          setQuery={fr.setQuery}
          replaceText={fr.replaceText}
          setReplaceText={fr.setReplaceText}
          caseSensitive={fr.caseSensitive}
          setCaseSensitive={fr.setCaseSensitive}
          matchesCount={fr.matches.length}
          activeIndex={fr.activeIndex}
          onNext={fr.nextMatch}
          onPrev={fr.prevMatch}
          onReplaceOne={onReplaceOne || (() => {})}
          onReplaceAll={onReplaceAll || (() => {})}
        />
      )}

      {/* Output content */}
      <div
        id="output-content"
        ref={contentRef}
        className={[
          'flex-1 w-full p-4 font-mono text-sm overflow-y-auto custom-scrollbar whitespace-pre-wrap break-words',
          isEmpty ? 'text-textMuted' : 'text-textMain',
        ].join(' ')}
        aria-label="Sanitized output"
        aria-live="polite"
      >
        {isEmpty ? 'Sanitized output will appear here…' : (
          segments.map((seg, i) => {
            if (seg.isMatch && seg.match) {
              const isDeletion = seg.text === '';
              return (
                <mark
                  key={i}
                  className={[
                    "bg-amber-200 dark:bg-amber-800/40 rounded-[2px] cursor-pointer transition-colors hover:bg-amber-300 dark:hover:bg-amber-700/50 text-inherit",
                    isDeletion ? "inline-block w-1 bg-red-300 dark:bg-red-800/50 hover:w-2" : "px-0.5"
                  ].join(' ')}
                  onMouseEnter={(e) => handleMouseEnter(e, seg.match!)}
                  onMouseLeave={handleMouseLeave}
                  title={`Replaced with: "${seg.match.original}"`}
                >
                  {isDeletion ? '\u200B' : seg.text}
                </mark>
              );
            }
            return <span key={i}>{seg.text}</span>;
          })
        )}
      </div>

      {hoveredMatch && (
        <button
          className="fixed z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-outline-variant rounded-md shadow-md text-xs font-medium text-slate-700 hover:text-primary hover:border-primary/30 transition-all"
          style={{ top: btnPos.top, left: btnPos.left }}
          onMouseEnter={handleBtnMouseEnter}
          onMouseLeave={handleBtnMouseLeave}
          onClick={() => {
            onRestoreMatch(hoveredMatch);
            setHoveredMatch(null);
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Restore "{hoveredMatch.original}"
        </button>
      )}

      {/* Bottom-right actions */}
      {!isEmpty && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            id="btn-copy-output"
            title="Copy output"
            onClick={onCopy}
            className={[
              'p-2 border rounded-md transition-all duration-200 shadow-sm text-sm font-medium flex items-center gap-1.5',
              copied
                ? 'border-secondary bg-secondary/10 text-secondary'
                : 'border-outline-variant bg-white text-slate-500 hover:bg-surface-container-low hover:text-primary hover:border-primary/30 hover:shadow-md hover:scale-105 active:scale-95',
            ].join(' ')}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            )}
          </button>

          <button
            id="btn-reinput"
            title="Send output to input"
            onClick={onReinput}
            className="p-2 border border-outline-variant rounded-md bg-white text-slate-500 hover:bg-surface-container-low hover:text-primary hover:border-primary/30 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 9l-4 4 4 4M5 13h14"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
