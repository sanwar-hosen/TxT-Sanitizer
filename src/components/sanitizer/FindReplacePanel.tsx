'use client';

import { useEffect, useRef } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  replaceText: string;
  setReplaceText: (r: string) => void;
  caseSensitive: boolean;
  setCaseSensitive: (c: boolean) => void;
  matchesCount: number;
  activeIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onReplaceOne: () => void;
  onReplaceAll: () => void;
}

export default function FindReplacePanel({
  isOpen,
  onClose,
  query,
  setQuery,
  replaceText,
  setReplaceText,
  caseSensitive,
  setCaseSensitive,
  matchesCount,
  activeIndex,
  onNext,
  onPrev,
  onReplaceOne,
  onReplaceAll,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 left-0 bg-white dark:bg-surface-container shadow-md border-b border-outline-variant z-20 p-2 text-sm flex flex-col gap-2 transition-transform transform origin-top duration-200">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Find"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) onPrev();
                else onNext();
              }
            }}
            className="w-full px-2 py-1.5 border border-outline-variant rounded-md bg-transparent focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            {matchesCount > 0 ? `${activeIndex + 1} of ${matchesCount}` : 'No results'}
          </span>
        </div>
        <button
          title="Match Case"
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`p-1.5 rounded-md border transition-colors ${
            caseSensitive
              ? 'bg-primary/10 border-primary text-primary'
              : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="font-mono text-xs font-bold leading-none">Aa</span>
        </button>
        <div className="flex items-center gap-0.5">
          <button
            title="Previous Match (Shift+Enter)"
            onClick={onPrev}
            disabled={matchesCount === 0}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            title="Next Match (Enter)"
            onClick={onNext}
            disabled={matchesCount === 0}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <button
          onClick={onClose}
          title="Close (Esc)"
          className="p-1.5 rounded-md text-slate-500 border border-outline-variant hover:bg-red-50 hover:text-red-500 hover:border-red-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md ml-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Replace"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-outline-variant rounded-md bg-transparent focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={onReplaceOne}
          disabled={matchesCount === 0}
          className="px-3 py-1.5 rounded-md border border-outline-variant text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors font-medium"
        >
          Replace
        </button>
        <button
          onClick={onReplaceAll}
          disabled={matchesCount === 0}
          className="px-3 py-1.5 rounded-md border border-outline-variant text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors font-medium"
        >
          Replace All
        </button>
      </div>
    </div>
  );
}
