'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";

const NAV_BTN_BASE = "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95";

export default function Navbar() {
  const { isDark, toggleDarkMode } = useDarkMode();
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
          {/* Dark mode toggle */}
          <button
            title="Toggle dark mode"
            onClick={toggleDarkMode}
            className={`${NAV_BTN_BASE} text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]`}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            )}
          </button>

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
          <div className="ml-2 h-6 w-px bg-[var(--border)]" />
          <span className="ml-2 text-xs font-medium text-[var(--text-muted)]">
            By{" "}
            <span className="font-semibold text-[var(--brand)]">Sano</span>
          </span>
        </nav>
      </div>
    </header>
  );
}
