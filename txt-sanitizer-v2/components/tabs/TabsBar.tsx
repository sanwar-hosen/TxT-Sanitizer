export type WorkspaceTab = {
  id: string;
  label: string;
};

type TabsBarProps = {
  tabs: WorkspaceTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabAdd: () => void;
  onTabClose: (tabId: string) => void;
};

export function TabsBar({ tabs, activeTabId, onTabSelect, onTabAdd, onTabClose }: TabsBarProps) {
  const canAdd = tabs.length < 3;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[#d8e2ec] pb-3">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTabSelect(tab.id)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              tab.id === activeTabId
                ? "border-[#0b5fcc] bg-[#eef5ff] text-[#0b5fcc]"
                : "border-[#ced8e3] bg-white text-[#41556e]"
            }`}
          >
            {tab.label}
          </button>
          {tabs.length > 1 ? (
            <button
              type="button"
              aria-label={`Close ${tab.label}`}
              onClick={() => onTabClose(tab.id)}
              className="rounded border border-[#d0d8e2] px-2 py-1 text-xs text-[#51657d] hover:bg-[#f1f5f9]"
            >
              X
            </button>
          ) : null}
        </div>
      ))}
      {canAdd ? (
        <button
          type="button"
          onClick={onTabAdd}
          className="rounded-md border border-dashed border-[#9fb8d8] bg-[#f5f9ff] px-3 py-1.5 text-sm font-medium text-[#25589c]"
        >
          + Add Tab
        </button>
      ) : null}
    </div>
  );
}
