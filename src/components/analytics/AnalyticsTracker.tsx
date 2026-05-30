'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPathname = useRef<string | null>(null);

  useEffect(() => {
    // Avoid tracking admin page views or duplicate tracking for the same pathname
    if (!pathname || pathname.startsWith('/admin') || lastTrackedPathname.current === pathname) {
      return;
    }

    lastTrackedPathname.current = pathname;

    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_type: 'page_view' }),
    }).catch(() => {
      // Silently catch network/analytics failures
    });
  }, [pathname]);

  return null;
}
