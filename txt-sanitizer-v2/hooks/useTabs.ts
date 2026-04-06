import { useState } from "react";
import type { WorkspaceTab } from "../components/tabs/TabsBar";

const MAX_TABS = 3;

export function useTabs() {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([{ id: "tab-1", label: "Tab 1" }]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [nextTabNumber, setNextTabNumber] = useState(2);

  function addTab(tabId: string, label: string) {
    setTabs((current: WorkspaceTab[]) => {
      if (current.length >= MAX_TABS) {
        return current;
      }

      setActiveTabId(tabId);
      return [...current, { id: tabId, label }];
    });
  }

  function createNextTab() {
    const tabId = `tab-${nextTabNumber}`;
    const label = `Tab ${nextTabNumber}`;
    setNextTabNumber((value) => value + 1);
    addTab(tabId, label);
    return tabId;
  }

  function closeTab(tabId: string) {
    setTabs((current: WorkspaceTab[]) => {
      if (current.length <= 1) {
        return current;
      }

      const next = current.filter((tab: WorkspaceTab) => tab.id !== tabId);
      if (!next.some((tab: WorkspaceTab) => tab.id === activeTabId)) {
        setActiveTabId(next[0]?.id ?? "tab-1");
      }
      return next;
    });
  }

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    createNextTab,
    closeTab,
  };
}
