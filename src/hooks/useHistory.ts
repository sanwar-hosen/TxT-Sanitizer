'use client';

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { HistoryEntry } from '@/types/preset';
import {
  loadHistory,
  appendHistory,
  deleteHistoryEntry as deleteFromStorage,
  clearHistory as clearFromStorage,
} from '@/lib/storage';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    // Load from localStorage on mount (client-only — fallback to empty for SSR)
    if (typeof window === 'undefined') return [];
    return loadHistory();
  });

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => {
      const full: HistoryEntry = {
        ...entry,
        id: nanoid(10),
        createdAt: new Date().toISOString(),
      };
      const next = appendHistory(full);
      setHistory(next);
      return full;
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    const next = deleteFromStorage(id);
    setHistory(next);
  }, []);

  const clearAll = useCallback(() => {
    clearFromStorage();
    setHistory([]);
  }, []);

  return { history, addEntry, deleteEntry, clearAll };
}
