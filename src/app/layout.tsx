import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TxT Sanitizer — Clean & Transform Your Text",
  description:
    "A free, fast, browser-based text sanitizer. Remove markdown, bypass platform word filters, and clean your text with custom presets.",
};

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import NotificationAlert from "@/components/notification/NotificationAlert";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={rubik.variable}>
      <head>
        {/* JetBrains Mono for pane text */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols for the check icon in status bar */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {/*
         * NotificationAlert renders as position:fixed — no layout shift.
         * It slides in from the top and collapses to a 4px peek strip.
         */}
        <NotificationAlert />

        <Navbar />

        {/*
         * Ad Slot: Below Navbar
         * Hidden by default (display:none via inline style).
         * Admin dashboard toggles visibility via the AdminAdsControl component,
         * which persists the state in localStorage and applies it on page load
         * by toggling the `data-ad-below-navbar` attribute on <html>.
         * The slot itself is always in the DOM so ad code can be injected.
         */}
        <div
          id="ad-below-navbar"
          className="w-full flex items-center justify-center bg-base-200 border-b border-base-300 hidden"
          style={{ minHeight: '90px' }}
          aria-hidden="true"
        >
          {/* Ad code goes here */}
        </div>

        <div className="flex-1 flex flex-col">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
