'use client';

import { useState, useRef, useEffect } from 'react';
import type { Preset } from '@/types/preset';

const PRESET_NAME_MAX = 30;

interface Props {
  visiblePresets: Preset[];
  overflowPresets: Preset[];
  hasOverflow: boolean;
  activePresetId: string;
  onSelect: (id: string) => void;
}

function truncateName(name: string): string {
  return name.length > PRESET_NAME_MAX ? name.slice(0, PRESET_NAME_MAX - 1) + '…' : name;
}

export default function PresetTabs({
  visiblePresets,
  overflowPresets,
  hasOverflow,
  activePresetId,
  onSelect,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <div className="flex items-end gap-px h-full">
      {/* Visible preset tabs — browser-tab style */}
      {visiblePresets.map((preset) => {
        const isActive = preset.id === activePresetId;
        return (
          <button
            key={preset.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(preset.id)}
            title={preset.name}
            className={[
              'group relative flex items-center gap-2 px-3 py-2 min-w-[80px] max-w-[160px] rounded-t-md cursor-pointer',
              'transition-all duration-200 text-[10px] font-semibold uppercase tracking-wider shrink-0',
              'border-t border-x',
              isActive
                ? 'bg-white dark:bg-[var(--surface)] text-primary dark:text-blue-400 shadow-[0_-2px_8px_-2px_rgba(0,74,173,0.12)] z-10 border-primary dark:border-blue-400 border-b-white dark:border-b-[var(--surface)] -mb-px'
                : 'text-gray-400 dark:text-slate-400/80 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-600 dark:hover:text-slate-200 hover:shadow-sm border-transparent hover:border-t hover:border-x hover:border-gray-200 dark:hover:border-slate-600',
            ].join(' ')}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            )}
            <span className="truncate">{truncateName(preset.name)}</span>
          </button>
        );
      })}

      {/* More / overflow button — chevron icon */}
      {hasOverflow && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            title="More presets"
            aria-label="Show more presets"
            className={[
              'flex items-center justify-center w-8 h-8 mb-0.5 rounded-md',
              'text-primary transition-all duration-200',
              'hover:bg-primary/10 hover:shadow-md hover:scale-110 active:scale-95',
              dropdownOpen ? 'bg-primary/10 shadow-sm' : '',
            ].join(' ')}
          >
            <svg
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: dropdownOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-50 min-w-[180px] bg-white dark:bg-[var(--surface-2)] border border-outline-variant dark:border-[var(--border)] rounded-lg shadow-lg py-1 overflow-hidden"
              style={{ animation: 'modalSlideUp 0.15s ease-out' }}
            >
              {overflowPresets.map((preset, i) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelect(preset.id);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-textMain dark:text-[var(--text)] hover:bg-primary/5 hover:text-primary dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-150 flex items-center gap-2"
                  style={{ animation: `modalSlideUp 0.15s ease-out ${i * 0.04}s both` }}
                >
                  {preset.id === activePresetId && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  <span className={preset.id === activePresetId ? 'text-primary font-semibold' : ''}>
                    {truncateName(preset.name)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
