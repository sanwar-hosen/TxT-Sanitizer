"use client";

import { useMemo, useState } from "react";
import { useRef } from "react";
import { TextEditor } from "@/components/editor/TextEditor";
import { OutputPanel } from "@/components/output/OutputPanel";
import { PresetList } from "@/components/tabs/PresetList";
import { TabsBar } from "@/components/tabs/TabsBar";
import { useTabs } from "@/hooks/useTabs";
import { addHistoryEntry, loadUserPresets, type UserPreset } from "@/lib/storage";
import type { Match } from "@/lib/sanitizer/sanitizeWithMetadata";
import { sanitizeWithMetadata } from "@/lib/sanitizer/sanitizeWithMetadata";
import type { Rule } from "@/lib/sanitizer/types";

type Preset = {
  id: string;
  name: string;
  rules: Rule[];
};

type WorkspaceState = {
  inputText: string;
  outputText: string;
  selectedPresetId: string;
  matches: Match[];
};

const SYSTEM_PRESETS: Preset[] = [
  {
    id: "chatgpt-normal",
    name: "ChatGPT → Normal",
    rules: [
      { type: "regex", find: "\\s+", replace: " " },
      { type: "text", find: " .", replace: "." },
      { type: "text", find: " ,", replace: "," },
    ],
  },
  {
    id: "fiverr-words",
    name: "Fiverr Words",
    rules: [
      { type: "regex", find: "\\bKindly\\b", replace: "Please", flags: "gi" },
      { type: "regex", find: "\\bASAP\\b", replace: "as soon as possible", flags: "gi" },
    ],
  },
];

const DEFAULT_PRESET_ID = SYSTEM_PRESETS[0]?.id ?? "";

function getInitialWorkspaceState(): WorkspaceState {
  return {
    inputText: "",
    outputText: "",
    selectedPresetId: DEFAULT_PRESET_ID,
    matches: [],
  };
}

function getInitialWorkspaceStateFromSession(): WorkspaceState {
  if (typeof window === "undefined") {
    return getInitialWorkspaceState();
  }

  const raw = sessionStorage.getItem("txt_sanitizer_edit_payload");
  if (!raw) {
    return getInitialWorkspaceState();
  }

  try {
    const parsed = JSON.parse(raw) as { inputText?: string; selectedPresetId?: string };
    sessionStorage.removeItem("txt_sanitizer_edit_payload");
    return {
      inputText: parsed.inputText ?? "",
      outputText: "",
      selectedPresetId: parsed.selectedPresetId ?? DEFAULT_PRESET_ID,
      matches: [],
    };
  } catch {
    sessionStorage.removeItem("txt_sanitizer_edit_payload");
    return getInitialWorkspaceState();
  }
}

export default function HomePage() {
  const { tabs, activeTabId, setActiveTabId, createNextTab, closeTab } = useTabs();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [userPresets] = useState<UserPreset[]>(() => loadUserPresets());
  const [workspaceByTab, setWorkspaceByTab] = useState<Record<string, WorkspaceState>>(() => ({
    "tab-1": getInitialWorkspaceStateFromSession(),
  }));

  const activeWorkspace = workspaceByTab[activeTabId] ?? getInitialWorkspaceState();

  const mergedPresets = useMemo(() => [...SYSTEM_PRESETS, ...userPresets], [userPresets]);

  const selectedPreset = useMemo(() => {
    return mergedPresets.find((preset) => preset.id === activeWorkspace.selectedPresetId) ?? mergedPresets[0];
  }, [activeWorkspace.selectedPresetId, mergedPresets]);

  function updateActiveWorkspace(next: Partial<WorkspaceState>) {
    setWorkspaceByTab((current) => {
      const previous = current[activeTabId] ?? getInitialWorkspaceState();
      return {
        ...current,
        [activeTabId]: {
          ...previous,
          ...next,
        },
      };
    });
  }

  function handleInputChange(value: string) {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 700);
    updateActiveWorkspace({ inputText: value });
  }

  function handleSanitize() {
    if (!selectedPreset || !activeWorkspace.inputText.trim()) {
      updateActiveWorkspace({ outputText: "", matches: [] });
      return;
    }

    const result = sanitizeWithMetadata(activeWorkspace.inputText, selectedPreset.rules);
    updateActiveWorkspace({
      outputText: result.output,
      matches: result.matches,
    });

    addHistoryEntry({
      input: activeWorkspace.inputText,
      output: result.output,
      presetId: selectedPreset.id,
      presetName: selectedPreset.name,
    });
  }

  async function handlePaste() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      updateActiveWorkspace({ inputText: clipboardText });
    } catch {
      alert("Clipboard access is blocked in this browser.");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeWorkspace.outputText);
    } catch {
      alert("Unable to copy text right now.");
    }
  }

  function handleReinput() {
    updateActiveWorkspace({ inputText: activeWorkspace.outputText });
  }

  function handleTabAdd() {
    const nextId = createNextTab();
    setWorkspaceByTab((current) => ({
      ...current,
      [nextId]: getInitialWorkspaceState(),
    }));
  }

  function handleTabClose(tabId: string) {
    closeTab(tabId);
    setWorkspaceByTab((current) => {
      const next = { ...current };
      delete next[tabId];
      return next;
    });
  }

  return (
    <section className="panel-shell mx-auto grid max-w-[1320px] gap-4 p-4">
      <TabsBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTabId}
        onTabAdd={handleTabAdd}
        onTabClose={handleTabClose}
      />

      <PresetList
        presets={mergedPresets.map((preset) => ({ id: preset.id, name: preset.name }))}
        selectedPresetId={activeWorkspace.selectedPresetId}
        onSelectPreset={(presetId) => updateActiveWorkspace({ selectedPresetId: presetId })}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <TextEditor
          value={activeWorkspace.inputText}
          onChange={handleInputChange}
          onSanitize={handleSanitize}
          onPaste={handlePaste}
          onFileUpload={(fileContent) => updateActiveWorkspace({ inputText: fileContent })}
          isTyping={isTyping}
        />
        <OutputPanel
          value={activeWorkspace.outputText}
          matchesCount={activeWorkspace.matches.length}
          onCopy={handleCopy}
          onReinput={handleReinput}
          onFindReplace={() => alert("Find & Replace UI is next in implementation.")}
        />
      </div>
    </section>
  );
}
