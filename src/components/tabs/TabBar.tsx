'use client';

import type { TabState } from '@/types/preset';

interface Props {
  tabs: TabState[];
  activeTabId: string;
  canAddTab: boolean;
  canCloseTab: boolean;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onClose: (id: string) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  canAddTab,
  canCloseTab,
  onSwitch,
  onAdd,
  onClose,
}: Props) {
  return (
    <div className="flex items-end gap-px">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const rawInput = tab.inputText?.trim() ?? '';
        const displayLabel =
          rawInput.length > 0
            ? rawInput.slice(0, 12) + (rawInput.length > 12 ? '…' : '')
            : tab.label;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSwitch(tab.id)}
            className={[
              'group relative flex items-center gap-2 px-3 py-2 min-w-[90px] max-w-[150px] flex-1 rounded-t-md cursor-pointer',
              'transition-all duration-200 text-xs font-medium shrink-0 border-t border-x',
              isActive
                ? 'bg-white dark:bg-[var(--surface)] text-primary dark:text-blue-400 shadow-[0_-2px_8px_-2px_rgba(0,74,173,0.12)] z-10 border-primary dark:border-blue-400 border-b-white dark:border-b-[var(--surface)] -mb-px'
                : 'text-gray-400 dark:text-slate-400/80 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-600 dark:hover:text-slate-200 border-transparent hover:border-t hover:border-x hover:border-gray-200 dark:hover:border-slate-600',
            ].join(' ')}
          >
            <span className="overflow-hidden whitespace-nowrap flex-grow text-left pointer-events-none">
              {displayLabel}
            </span>

            {/* Close button — red accent like clear-input X */}
            {canCloseTab && (
              <span
                role="button"
                aria-label={`Close ${displayLabel}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                className={[
                  'p-0.5 rounded transition-all duration-200 shrink-0 leading-none border border-transparent',
                  'hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-400 dark:hover:border-red-500 hover:scale-110 active:scale-90',
                  isActive ? 'opacity-70 hover:opacity-100 text-gray-400' : 'opacity-0 group-hover:opacity-60 text-gray-400',
                ].join(' ')}
              >
                <svg fill="none" height="12" width="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </span>
            )}
          </button>
        );
      })}

      {/* Add tab button — blue accent */}
      {canAddTab && (
        <button
          aria-label="Add new tab"
          title="New Tab"
          onClick={onAdd}
          className="p-1.5 ml-1 mb-1 rounded-md border border-transparent text-gray-400 hover:bg-primary/10 hover:text-primary hover:border-primary/30 hover:shadow-lg hover:scale-[1.15] active:scale-90 transition-all duration-200 shrink-0"
        >
          <svg fill="none" height="16" width="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
