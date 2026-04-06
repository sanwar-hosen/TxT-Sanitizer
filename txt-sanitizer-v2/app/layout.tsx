import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TxT Sanitizer",
  description: "Text sanitization workspace",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col">
          <header className="border-b border-[#d9e1ea] bg-[#f6f7f9] px-6 py-3">
            <nav className="flex items-center justify-between gap-4">
              <div className="flex items-end gap-3">
                <Link href="/" className="text-4xl font-extrabold leading-none tracking-tight text-[#0d57b7]">
                  TxT Sanitizer
                </Link>
                <span className="pb-0.5 text-sm text-[#334155]">By Sano</span>
              </div>
              <div className="flex items-center gap-5 text-sm font-semibold">
                <Link href="/history" className="app-link">
                  History
                </Link>
                <Link href="/settings" className="app-link" aria-label="Open settings">
                  Settings
                </Link>
                <Link href="/about" className="app-link" aria-label="About page">
                  About
                </Link>
                <button type="button" className="app-link" aria-label="Open feedback dialog">
                  Feedback
                </button>
                <button type="button" className="app-link" aria-label="Toggle dark mode">
                  Theme
                </button>
              </div>
            </nav>
          </header>

          <main className="flex-1 px-4 py-3 md:px-6">{children}</main>

          <footer className="mt-3 border-t border-[#d9e1ea] bg-[#f6f7f9] px-6 py-3 text-sm text-[#334155]">
            <div className="flex items-center justify-between gap-3">
              <span>Made With Love By Sano</span>
              <span>For Maintenance</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
