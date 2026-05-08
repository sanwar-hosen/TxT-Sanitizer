'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTabs } from '@/hooks/useTabs';
import { usePresets } from '@/hooks/usePresets';
import { useHistory } from '@/hooks/useHistory';
import { useFindReplace } from '@/hooks/useFindReplace';
import { sanitize, countWords, countChars } from '@/lib/sanitizer';
import PresetTabs from '@/components/sanitizer/PresetTabs';
import TabBar from '@/components/tabs/TabBar';
import InputPanel from '@/components/sanitizer/InputPanel';
import OutputPanel from '@/components/sanitizer/OutputPanel';

export default function Home() {
  // ── Hooks ───────────────────────────────────────────────────────────────────
  const {
    tabs,
    activeTab,
    activeTabId,
    hydrated,
    canAddTab,
    canCloseTab,
    addTab,
    closeTab,
    switchTab,
    updateActiveTab,
  } = useTabs();

  const {
    visiblePresets,
    overflowPresets,
    hasOverflow,
    activePreset,
    activePresetId,
    selectPreset,
  } = usePresets();

  const { addEntry } = useHistory();

  // ── Local state ──────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const [isSanitizing, setIsSanitizing] = useState(false);

  // ── Pick up "Edit in Workspace" from History page ───────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    const text = sessionStorage.getItem('txts_v2_editFromHistory');
    if (text) {
      sessionStorage.removeItem('txts_v2_editFromHistory');
      updateActiveTab({ inputText: text, outputText: '', matches: [] });
    }
  }, [hydrated, updateActiveTab]);

  // F&R logic is lifted here because it operates on Input text but UI is in Output panel
  const fr = useFindReplace(activeTab?.inputText ?? '');

  const handleReplaceOne = useCallback(() => {
    if (fr.activeIndex === -1 || fr.matches.length === 0) return;
    const match = fr.matches[fr.activeIndex];
    const text = activeTab?.inputText ?? '';
    const newText = text.slice(0, match.startIndex) + fr.replaceText + text.slice(match.endIndex);
    updateActiveTab({ inputText: newText });
  }, [fr, activeTab, updateActiveTab]);

  const handleReplaceAll = useCallback(() => {
    if (fr.matches.length === 0) return;
    let currentText = activeTab?.inputText ?? '';
    for (let i = fr.matches.length - 1; i >= 0; i--) {
      const match = fr.matches[i];
      currentText = currentText.slice(0, match.startIndex) + fr.replaceText + currentText.slice(match.endIndex);
    }
    updateActiveTab({ inputText: currentText });
  }, [fr, activeTab, updateActiveTab]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  /** Update input text for the active tab */
  const handleInputChange = useCallback(
    (text: string) => {
      if (!text.trim()) {
        updateActiveTab({ inputText: text, outputText: '', matches: [] });
      } else {
        updateActiveTab({ inputText: text });
      }
    },
    [updateActiveTab]
  );

  /** Run sanitizer, update output + match metadata, save to history */
  const handleSanitize = useCallback(() => {
    if (!activeTab || !activeTab.inputText.trim()) return;
    setIsSanitizing(true);

    // Wrap in rAF to allow UI to update (show loading state) before heavy work
    requestAnimationFrame(() => {
      const { output, matches } = sanitize(activeTab.inputText, activePreset.rules);
      updateActiveTab({ outputText: output, matches });

      addEntry({
        presetId: activePreset.id,
        presetName: activePreset.name,
        inputText: activeTab.inputText,
        outputText: output,
        matchCount: matches.length,
      });

      setIsSanitizing(false);
    });
  }, [activeTab, activePreset, updateActiveTab, addEntry]);

  /** Copy output to clipboard */
  const handleCopy = useCallback(async () => {
    if (!activeTab?.outputText) return;
    try {
      await navigator.clipboard.writeText(activeTab.outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without Clipboard API
      const el = document.getElementById('output-content');
      if (el) {
        const range = document.createRange();
        range.selectNode(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [activeTab]);

  /** Send output back to input, clear output */
  const handleReinput = useCallback(() => {
    if (!activeTab?.outputText) return;
    updateActiveTab({
      inputText: activeTab.outputText,
      outputText: '',
      matches: [],
    });
  }, [activeTab, updateActiveTab]);

  /** Restore a single match back to its original value */
  const handleRestoreMatch = useCallback((match: import('@/types/preset').Match) => {
    if (!activeTab) return;
    // Dynamic import to avoid top-level import conflict if needed, but standard import is fine.
    // Wait, let's just use the function since we'll import it.
    const { restoreMatch } = require('@/lib/restore');
    const { output, matches } = restoreMatch(activeTab.outputText, activeTab.matches, match);
    updateActiveTab({ outputText: output, matches });
  }, [activeTab, updateActiveTab]);

  // ── Preset select (also syncs to active tab) ─────────────────────────────────
  const handleSelectPreset = useCallback(
    (id: string) => {
      selectPreset(id);
      updateActiveTab({ selectedPresetId: id });
    },
    [selectPreset, updateActiveTab]
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  if (!hydrated) {
    // Skeleton while localStorage hydrates (avoids SSR/client mismatch)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef2f6]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col font-sans p-4 md:p-8">

      {/* ── Main card ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] w-full mx-auto bg-white rounded-lg shadow-sm border border-outline-variant flex flex-col overflow-hidden h-[calc(100vh-9rem)] min-h-[500px]">

        {/* ── TopToolbar ─────────────────────────────────────────────────────── */}
        <header className="flex items-end justify-between px-4 border-b border-outline-variant bg-white pt-3 shrink-0">

          {/* LEFT: Preset tabs */}
          <PresetTabs
            visiblePresets={visiblePresets}
            overflowPresets={overflowPresets}
            hasOverflow={hasOverflow}
            activePresetId={activePresetId}
            onSelect={handleSelectPreset}
          />

          {/* RIGHT: Workspace tabs */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            canAddTab={canAddTab}
            canCloseTab={canCloseTab}
            onSwitch={switchTab}
            onAdd={addTab}
            onClose={closeTab}
          />

        </header>
        {/* ── END TopToolbar ─────────────────────────────────────────────────── */}

        {/* ── Workspace Area ──────────────────────────────────────────────────── */}
        <main className="flex-1 bg-white overflow-hidden flex min-h-0">
          <div className="flex-1 flex w-full min-h-0">

            <InputPanel
              value={activeTab?.inputText ?? ''}
              onChange={handleInputChange}
              onSanitize={handleSanitize}
              isSanitizing={isSanitizing}
              frMatches={fr.matches}
              frActiveIndex={fr.activeIndex}
            />

            <OutputPanel
              value={activeTab?.outputText ?? ''}
              matches={activeTab?.matches ?? []}
              onCopy={handleCopy}
              onReinput={handleReinput}
              onRestoreMatch={handleRestoreMatch}
              copied={copied}
              fr={fr}
              onReplaceOne={handleReplaceOne}
              onReplaceAll={handleReplaceAll}
            />

          </div>
        </main>
        {/* ── END Workspace Area ───────────────────────────────────────────────── */}

        {/* ── Status Bar ──────────────────────────────────────────────────────── */}
        <footer className="px-4 flex justify-between items-center text-[11px] text-slate-500 bg-slate-50 border-t border-outline-variant h-10 shrink-0">
          
          {/* Left: input stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-slate-800">
                {countWords(activeTab?.inputText ?? '').toLocaleString()}
              </span>
              <span className="text-slate-400">Words</span>
            </div>
            <div className="h-3 w-px bg-slate-300" />
            <div className="flex items-center space-x-1">
              <span className="font-bold text-slate-800">
                {countChars(activeTab?.inputText ?? '').toLocaleString()}
              </span>
              <span className="text-slate-400">Characters</span>
            </div>
          </div>

          {/* Right: output stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-slate-800">
                {countChars(activeTab?.outputText ?? '').toLocaleString()}
              </span>
              <span className="text-slate-400">Characters</span>
            </div>
            <div className="h-3 w-px bg-slate-300" />
            {(() => {
              const flagged = activeTab?.matches?.length ?? 0;
              const hasFlagged = flagged > 0;
              return (
                <div className={`flex items-center space-x-1 transition-colors duration-300 ${hasFlagged ? 'text-red-500' : 'text-slate-400'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {hasFlagged ? 'flag' : 'check'}
                  </span>
                  <span className={`font-bold ${hasFlagged ? 'text-red-600' : 'text-slate-800'}`}>{flagged}</span>
                  <span>Flagged</span>
                </div>
              );
            })()}
          </div>

        </footer>
        {/* ── END Status Bar ──────────────────────────────────────────────────── */}

      </div>
      {/* ── END Main card ──────────────────────────────────────────────────────── */}

    </div>
  );
}
