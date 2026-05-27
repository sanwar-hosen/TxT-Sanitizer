'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '@/components/shared/Modal';

interface AlertData {
  enabled: boolean;
  heading: string;
  hasLearnMore: boolean;
  body: string;
  version: number;
}

const STORAGE_KEY = 'txts_v2_alertVersion';
const HOVER_ZONE_WIDTH = 320; // px — width of the top-center hover-sensitive area

export default function NotificationAlert() {
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch alert config on mount ─────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    fetch('/api/notification-alert')
      .then((r) => r.json())
      .then((data: AlertData) => {
        if (!data.enabled) return;

        // Version-awareness: if admin bumped version, reset dismiss state
        const storedVersion = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
        if (storedVersion < data.version) {
          localStorage.removeItem(`${STORAGE_KEY}_dismissed`);
        }
        localStorage.setItem(STORAGE_KEY, String(data.version));

        const wasDismissed =
          localStorage.getItem(`${STORAGE_KEY}_dismissed`) === '1';
        setDismissed(wasDismissed);
        setAlert(data);

        // Slide in after a brief delay so the page settles first
        if (!wasDismissed) {
          setTimeout(() => setExpanded(true), 600);
        }
      })
      .catch(() => {
        // Silently ignore — alert is not critical
      });
  }, []);

  // ── Hover-reveal via mouse position tracking ────────────────────────────────
  useEffect(() => {
    if (!alert || dismissed) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dismissed) return;
      const viewportWidth = window.innerWidth;
      const zoneLeft = (viewportWidth - HOVER_ZONE_WIDTH) / 2;
      const zoneRight = zoneLeft + HOVER_ZONE_WIDTH;
      const isInZone = e.clientY < 20 && e.clientX >= zoneLeft && e.clientX <= zoneRight;

      if (isInZone) {
        if (collapseTimerRef.current) {
          clearTimeout(collapseTimerRef.current);
          collapseTimerRef.current = null;
        }
        setExpanded(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [alert, dismissed]);

  // ── Collapse when mouse leaves the bar ──────────────────────────────────────
  const handleMouseLeave = useCallback(() => {
    if (dismissed) return;
    collapseTimerRef.current = setTimeout(() => {
      setExpanded(false);
    }, 400);
  }, [dismissed]);

  const handleMouseEnter = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setExpanded(true);
  }, []);

  // ── Dismiss ─────────────────────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    setExpanded(false);
    setTimeout(() => setDismissed(true), 350);
    localStorage.setItem(`${STORAGE_KEY}_dismissed`, '1');
  }, []);

  // ── Cleanup timer on unmount ─────────────────────────────────────────────────
  useEffect(() => () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
  }, []);

  // Don't render anything until:
  // 1. Component is mounted (avoids SSR hydration mismatch)
  // 2. Alert data is loaded and enabled
  if (!mounted || !alert || !alert.enabled || dismissed) return null;

  return (
    <>
      {/* ── Slide-in Banner ─────────────────────────────────────────────────── */}
      <div
        ref={barRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed top-0 left-0 right-0 z-[9998] flex justify-center pointer-events-none"
        style={{ willChange: 'transform' }}
        aria-live="polite"
        aria-label="Notification banner"
      >
        {/* The actual pill-shaped banner */}
        <div
          className={`
            pointer-events-auto
            relative flex items-center gap-3
            mx-auto mt-0
            px-4 py-2.5
            bg-base-200 border border-base-300
            shadow-lg backdrop-blur-sm
            rounded-b-2xl
            max-w-2xl w-full
            transition-transform duration-300 ease-out
            ${expanded ? 'translate-y-0' : '-translate-y-[calc(100%-4px)]'}
          `}
          style={{
            boxShadow: expanded
              ? '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)'
              : '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* Info icon */}
          <span className="shrink-0 text-primary text-base leading-none select-none" aria-hidden="true">
            ⓘ
          </span>

          {/* Heading */}
          <p className="flex-1 text-sm font-semibold text-base-content truncate min-w-0">
            {alert.heading}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {alert.hasLearnMore && (
              <button
                onClick={() => setLearnMoreOpen(true)}
                className="btn btn-primary btn-xs rounded-full text-[11px] font-semibold px-3 transition-all hover:scale-105 active:scale-95"
                aria-label="Learn more about this notification"
              >
                Learn More
              </button>
            )}

            {/* Dismiss / close */}
            <button
              onClick={handleDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-full text-base-content/50 hover:text-base-content hover:bg-base-300 transition-all duration-150 hover:scale-110 active:scale-95"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 4px "peek" strip indicator visible when collapsed */}
          {!expanded && (
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary/40"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* ── Learn More Modal ─────────────────────────────────────────────────── */}
      {alert.hasLearnMore && (
        <Modal
          open={learnMoreOpen}
          onClose={() => setLearnMoreOpen(false)}
          title={alert.heading}
          size="md"
        >
          <div className="text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {alert.body || (
              <span className="italic text-base-content/40">No additional details provided.</span>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
