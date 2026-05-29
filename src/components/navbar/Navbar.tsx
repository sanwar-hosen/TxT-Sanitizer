'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDarkMode, ThemeId } from "@/hooks/useDarkMode";

const THEMES: { id: ThemeId; name: string; preview: string[] }[] = [
  { id: 'light', name: 'Light', preview: ['#004AAD', '#ffffff', '#0b1c30'] },
  { id: 'dark', name: 'Dark', preview: ['#60a5fa', '#0f172a', '#e2e8f0'] },
  { id: 'cupcake', name: 'Cupcake', preview: ['#65c3c8', '#faf7f5', '#291334'] },
  { id: 'emerald', name: 'Emerald', preview: ['#66cc8a', '#ffffff', '#333c4d'] },
  { id: 'synthwave', name: 'Synthwave', preview: ['#e779c1', '#1a103c', '#f1f1f1'] },
  { id: 'retro', name: 'Retro', preview: ['#ef9fbc', '#ece3ca', '#282425'] },
  { id: 'halloween', name: 'Halloween', preview: ['#f28c18', '#1a1a1a', '#f1f1f1'] },
  { id: 'forest', name: 'Forest', preview: ['#1eb854', '#171212', '#f1f1f1'] },
  { id: 'wireframe', name: 'Wireframe', preview: ['#b8b8b8', '#ffffff', '#000000'] },
  { id: 'dracula', name: 'Dracula', preview: ['#ff79c6', '#282a36', '#f8f8f2'] },
  { id: 'coffee', name: 'Coffee', preview: ['#db924b', '#20161f', '#f1f1f1'] },
  { id: 'abyss', name: 'Abyss', preview: ['#1d4ed8', '#0f172a', '#e2e8f0'] },
  { id: 'sunset', name: 'Sunset', preview: ['#ff865b', '#120e16', '#f1f1f1'] },
  { id: 'silk', name: 'Silk', preview: ['#9aa5b1', '#f3f4f6', '#1f2937'] },
];

const NAV_BTN_BASE = "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95";

export default function Navbar() {
  const { theme, selectTheme } = useDarkMode();
  const pathname = usePathname();

  function navCls(href: string) {
    const isActive = pathname === href;
    return `${NAV_BTN_BASE} ${
      isActive
        ? 'text-[var(--brand)] bg-[var(--brand)]/10 shadow-sm'
        : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
    }`;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none group">
          <span
            className="text-xl font-bold tracking-tight transition-all duration-200 group-hover:scale-105"
            style={{ color: "var(--brand)" }}
          >
            TxT
          </span>
          <span className="text-xl font-semibold text-[var(--text)] transition-all duration-200 group-hover:scale-105">
            Sanitizer
          </span>
          <span className="ml-1 rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-white tracking-wider uppercase transition-all duration-200 group-hover:shadow-md group-hover:scale-110">
            v2
          </span>
        </Link>
 
        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {/* Theme selection dropdown */}
          <div className="dropdown dropdown-hover dropdown-end z-50">
            <button
              tabIndex={0}
              className={`${NAV_BTN_BASE} text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]`}
              title="Select Theme"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
              </svg>
            </button>
            <div
              tabIndex={0}
              className="dropdown-content p-2 shadow-lg bg-base-100 border border-base-300 rounded-xl w-80 z-50"
            >
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      data-theme={t.id}
                      onClick={() => selectTheme(t.id)}
                      className={`flex rounded-lg overflow-hidden text-left border text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer ${
                        isActive
                          ? 'border-primary ring-1 ring-primary'
                          : 'border-base-content/10 bg-base-100'
                      }`}
                    >
                      {/* Left vertical strip */}
                      <div className="w-3 bg-base-300 shrink-0" />
                      
                      {/* Right content */}
                      <div className="flex-1 p-2 bg-base-100 text-base-content flex flex-col gap-1.5 min-w-0">
                        <span className="font-bold tracking-wide capitalize text-[10px] truncate">{t.name}</span>
                        <div className="flex gap-0.5">
                          <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-primary text-[9px] font-bold text-primary-content shrink-0">A</span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-secondary text-[9px] font-bold text-secondary-content shrink-0">A</span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-accent text-[9px] font-bold text-accent-content shrink-0">A</span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-neutral text-[9px] font-bold text-neutral-content shrink-0">A</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* History */}
          <Link href="/history" title="History" className={navCls('/history')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
          </Link>

          {/* Settings */}
          <Link href="/settings" title="Settings" className={navCls('/settings')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>

          {/* About */}
          <Link href="/about" title="About" className={navCls('/about')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </Link>

          {/* By Sano */}
          <div className="hidden sm:block ml-2 h-6 w-px bg-[var(--border)]" />
          <span className="hidden sm:inline ml-2 text-xs font-medium text-[var(--text-muted)]">
            By{" "}
            <span className="font-semibold text-[var(--brand)]">Sano</span>
          </span>
        </nav>
      </div>
    </header>
  );
}
