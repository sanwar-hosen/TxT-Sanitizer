'use client';

import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type { TabState } from '@/types/preset';
import {
  loadTabs,
  saveTabs,
  loadActiveTabId,
  saveActiveTabId,
  loadLastSelectedPresetId,
} from '@/lib/storage';
import { DEFAULT_PRESETS } from '@/data/defaultPresets';

const MAX_TABS = 3;

function makeTab(label: string, presetId: string): TabState {
  return {
    id: nanoid(8),
    label,
    inputText: '',
    outputText: '',
    selectedPresetId: presetId,
    matches: [],
  };
}

function getInitialPresetId(): string {
  const last = loadLastSelectedPresetId();
  if (last) return last;
  return DEFAULT_PRESETS[0]?.id ?? '';
}

function getInitialState(): { tabs: TabState[]; activeId: string } {
  const stored = loadTabs();
  const activeId = loadActiveTabId();

  if (stored.length > 0) {
    const resolvedActive =
      stored.find((t) => t.id === activeId)?.id ?? stored[0].id;
    return { tabs: stored, activeId: resolvedActive };
  }

  const first = makeTab('Tab 1', getInitialPresetId());
  return { tabs: [first], activeId: first.id };
}

export function useTabs() {
  const [tabs, setTabsRaw] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabIdRaw] = useState<string>('');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    const { tabs: t, activeId } = getInitialState();
    setTabsRaw(t);
    setActiveTabIdRaw(activeId);
    setHydrated(true);
  }, []);

  // Persist whenever tabs change
  const setTabs = useCallback((next: TabState[] | ((prev: TabState[]) => TabState[])) => {
    setTabsRaw((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      saveTabs(resolved);
      return resolved;
    });
  }, []);

  const setActiveTabId = useCallback((id: string) => {
    setActiveTabIdRaw(id);
    saveActiveTabId(id);
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // ── Mutators ─────────────────────────────────────────────────────────────────

  /** Update a single field on the active tab */
  const updateActiveTab = useCallback(
    (patch: Partial<Omit<TabState, 'id'>>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...patch } : t))
      );
    },
    [activeTabId, setTabs]
  );

  /** Update a single field on any tab by id */
  const updateTab = useCallback(
    (id: string, patch: Partial<Omit<TabState, 'id'>>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
    },
    [setTabs]
  );

  /** Add a new tab (max 3) */
  const addTab = useCallback(() => {
    setTabs((prev) => {
      if (prev.length >= MAX_TABS) return prev;
      const label = `Tab ${prev.length + 1}`;
      const presetId = getInitialPresetId();
      const newTab = makeTab(label, presetId);
      const next = [...prev, newTab];
      // Switch to the new tab
      setActiveTabIdRaw(newTab.id);
      saveActiveTabId(newTab.id);
      return next;
    });
  }, [setTabs]);

  /** Close a tab by id */
  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev; // cannot close the last tab
        const next = prev.filter((t) => t.id !== id);
        // If we're closing the active tab, switch to the nearest
        if (id === activeTabId) {
          const closedIdx = prev.findIndex((t) => t.id === id);
          const newActive = next[Math.max(0, closedIdx - 1)];
          setActiveTabIdRaw(newActive.id);
          saveActiveTabId(newActive.id);
        }
        return next;
      });
    },
    [activeTabId, setTabs]
  );

  /** Switch to a tab by id */
  const switchTab = useCallback(
    (id: string) => {
      setActiveTabId(id);
    },
    [setActiveTabId]
  );

  return {
    tabs,
    activeTab,
    activeTabId,
    hydrated,
    canAddTab: tabs.length < MAX_TABS,
    canCloseTab: tabs.length > 1,
    addTab,
    closeTab,
    switchTab,
    updateActiveTab,
    updateTab,
  };
}
