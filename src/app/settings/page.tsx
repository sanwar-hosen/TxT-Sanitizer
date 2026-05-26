'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import type { Preset, Rule } from '@/types/preset';
import {
  loadUserPresets, saveUserPresets,
  loadPresetOverrides, savePresetOverride, removePresetOverride,
  clearHistory, clearAll,
} from '@/lib/storage';
import Modal from '@/components/shared/Modal';
import { useSystemPresets } from '@/hooks/useSystemPresets';
import { Button } from '@/components/shared/Button';

const PRESET_NAME_MAX = 30;

// ── Preset Editor Sub-component ─────────────────────────────────────────────
function PresetEditorModal({
  open, onClose, initial, onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Preset | null;
  onSave: (preset: Preset) => void;
}) {
  const [name, setName] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const dragIdx = useRef<number | null>(null);

  useEffect(() => {
    if (open && initial) {
      setName(initial.name);
      setRules(initial.rules.map((r) => ({ ...r })));
    } else if (open) {
      setName('');
      setRules([{ priority: 1, find: '', replace: '' }]);
    }
  }, [open, initial]);

  const addRule = () => {
    const maxP = rules.reduce((m, r) => Math.max(m, r.priority), 0);
    setRules([...rules, { priority: maxP + 1, find: '', replace: '' }]);
  };

  const removeRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  const updateRule = (idx: number, field: keyof Rule, value: string | number) => {
    setRules(rules.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const reordered = [...rules];
    const [moved] = reordered.splice(dragIdx.current, 1);
    reordered.splice(idx, 0, moved);
    dragIdx.current = idx;
    setRules(reordered);
  };
  const handleDragEnd = () => { dragIdx.current = null; };

  const handleSave = () => {
    if (!name.trim() || rules.length === 0) return;
    const validRules = rules.filter((r) => r.find.trim());
    if (validRules.length === 0) return;
    onSave({
      id: initial?.id ?? nanoid(10),
      name: name.trim().slice(0, PRESET_NAME_MAX),
      rules: validRules.map((r, i) => ({ ...r, priority: i + 1 })),
      isDefault: initial?.isDefault ?? false,
    });
    onClose();
  };

  const canSave = name.trim() && rules.some((r) => r.find.trim());

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Preset' : 'New Preset'} size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!canSave}>Save Preset</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Preset Name <span className="font-normal normal-case tracking-normal text-on-surface-variant/60">(max {PRESET_NAME_MAX} chars)</span></label>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, PRESET_NAME_MAX))} maxLength={PRESET_NAME_MAX} placeholder="e.g. My Custom Preset" className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-[var(--border)] bg-white dark:bg-[var(--surface-2)] text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
          <div className="text-right text-[10px] text-on-surface-variant mt-1">{name.length}/{PRESET_NAME_MAX}</div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rules</label>
            <Button variant="ghost" size="sm" onClick={addRule} className="text-primary hover:text-primary-hover border border-transparent hover:border-primary/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Add Rule
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-2 bg-surface-container-low rounded-lg p-2.5 border border-outline-variant/50 transition-shadow hover:shadow-sm"
              >
                {/* Drag handle — 6 dots */}
                <span className="shrink-0 cursor-grab active:cursor-grabbing text-on-surface-variant/40 hover:text-on-surface-variant transition-colors" title="Drag to reorder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
                </span>
                <input value={rule.find} onChange={(e) => updateRule(idx, 'find', e.target.value)} placeholder="Find" className="flex-1 px-2.5 py-1.5 rounded-md border border-outline-variant dark:border-[var(--border)] bg-white dark:bg-[var(--surface-2)] text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors min-w-0" />
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <input value={rule.replace} onChange={(e) => updateRule(idx, 'replace', e.target.value)} placeholder="Replace" className="flex-1 px-2.5 py-1.5 rounded-md border border-outline-variant dark:border-[var(--border)] bg-white dark:bg-[var(--surface-2)] text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors min-w-0" />
                {/* Remove rule — red accent */}
                <Button variant="danger-outline" size="sm" onClick={() => removeRule(idx)} disabled={rules.length <= 1} className="shrink-0 p-1 rounded min-w-0 h-7 w-7">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Settings Page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch system presets from API (falls back to defaults)
  const { systemPresets: fetchedSystemPresets } = useSystemPresets();

  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Preset>>({});
  const [manualSanitize, setManualSanitize] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    setUserPresets(loadUserPresets());
    setOverrides(loadPresetOverrides());
    const { loadManualSanitize } = require('@/lib/storage');
    setManualSanitize(loadManualSanitize());
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── User Preset CRUD ──────────────────────────────────────────────────────
  const handleSavePreset = useCallback((preset: Preset) => {
    setUserPresets((prev) => {
      const exists = prev.find((p) => p.id === preset.id);
      const next = exists ? prev.map((p) => (p.id === preset.id ? preset : p)) : [...prev, preset];
      saveUserPresets(next);
      return next;
    });
    showToast(editingPreset ? 'Preset updated' : 'Preset created');
  }, [editingPreset, showToast]);

  const handleDeleteUserPreset = useCallback((id: string) => {
    setUserPresets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveUserPresets(next);
      return next;
    });
    showToast('Preset deleted');
  }, [showToast]);

  // ── System Preset Override ────────────────────────────────────────────────
  const handleSaveSystemOverride = useCallback((preset: Preset) => {
    savePresetOverride(preset);
    setOverrides((prev) => ({ ...prev, [preset.id]: preset }));
    showToast('System preset modified locally');
  }, [showToast]);

  const handleResetToDefault = useCallback((id: string) => {
    removePresetOverride(id);
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast('Preset reset to default');
  }, [showToast]);

  // ── Import/Export ─────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const data = JSON.stringify(userPresets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `txt-sanitizer-presets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Presets exported');
  }, [userPresets, showToast]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string) as Preset[];
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        const validated = imported.filter((p) => p.name && Array.isArray(p.rules));
        const withIds = validated.map((p) => ({ ...p, id: p.id || nanoid(10), name: p.name.slice(0, PRESET_NAME_MAX), isDefault: false }));
        setUserPresets((prev) => {
          const next = [...prev, ...withIds];
          saveUserPresets(next);
          return next;
        });
        showToast(`Imported ${withIds.length} preset(s)`);
      } catch {
        showToast('Failed to import — invalid file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [showToast]);

  // ── Data Management ───────────────────────────────────────────────────────
  const handleClearHistory = useCallback(() => {
    clearHistory();
    setShowClearHistoryModal(false);
    showToast('History cleared');
  }, [showToast]);

  const handleClearAll = useCallback(() => {
    clearAll();
    setShowClearAllModal(false);
    setUserPresets([]);
    setOverrides({});
    showToast('All data cleared');
  }, [showToast]);

  // Get effective system presets (with local overrides applied)
  // Uses fetched presets from API; falls back to defaults if unavailable
  const systemPresets = fetchedSystemPresets.map((p) => overrides[p.id] ?? p);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8">
      <div className="max-w-[800px] w-full mx-auto space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="w-8 h-8 rounded-lg p-0 text-on-surface-variant hover:text-on-surface hover:shadow-md hover:scale-110" title="Back to Sanitizer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></svg>
          </Button>
          <h1 className="text-xl font-bold text-on-surface">Settings</h1>
        </div>

        {/* ── System Presets Section — primary blue accent ─────────────── */}
        <section className="bg-white dark:bg-[var(--surface)] rounded-xl border border-primary/15 dark:border-blue-400/15 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-primary/10 bg-primary/[0.03]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <h2 className="text-sm font-semibold text-on-surface">System Presets</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 ml-3.5">Default presets. Edits are saved locally only.</p>
          </div>
          <div className="divide-y divide-outline-variant/50">
            {systemPresets.map((preset) => {
              const isOverridden = !!overrides[preset.id];
              return (
                <div key={preset.id} className="flex items-center justify-between px-5 py-3 hover:bg-primary/[0.02] transition-colors">
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-on-surface">{preset.name}</span>
                    <p className="text-xs text-on-surface-variant mt-0.5">{preset.rules.length} rule{preset.rules.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => { setEditingPreset(preset); setEditorOpen(true); }}>Edit</Button>
                    {isOverridden && (
                      <Button variant="outline" size="sm" onClick={() => handleResetToDefault(preset.id)}>Reset</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── User Presets Section ─────────────────────────────────────── */}
        <section className="bg-white dark:bg-[var(--surface)] rounded-xl border border-outline-variant dark:border-[var(--border)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low/40 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Your Presets</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Custom presets you&apos;ve created.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditingPreset(null); setEditorOpen(true); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              New Preset
            </Button>
          </div>
          {userPresets.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-on-surface-variant">No custom presets yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/50">
              {userPresets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-container-low/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-on-surface">{preset.name}</span>
                    <p className="text-xs text-on-surface-variant mt-0.5">{preset.rules.length} rule{preset.rules.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => { setEditingPreset(preset); setEditorOpen(true); }}>Edit</Button>
                    <Button variant="danger-outline" size="sm" onClick={() => handleDeleteUserPreset(preset.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Preferences Section ─────────────────────────────────────── */}
        <section className="bg-white dark:bg-[var(--surface)] rounded-xl border border-outline-variant dark:border-[var(--border)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low/40">
            <h2 className="text-sm font-semibold text-on-surface">Preferences</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Customize your text editing preferences.</p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-on-surface">Real-Time (Auto) Sanitization</span>
              <p className="text-xs text-on-surface-variant mt-0.5">Automatically sanitize text as you type, without manual clicking.</p>
            </div>
            <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant shrink-0 select-none">
              <button
                type="button"
                onClick={() => {
                  setManualSanitize(false);
                  const { saveManualSanitize } = require('@/lib/storage');
                  saveManualSanitize(false);
                  showToast('Real-Time (Auto) Sanitization enabled');
                }}
                className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all duration-200 ${
                  !manualSanitize
                    ? 'bg-primary text-on-primary shadow-[0_2px_8px_rgba(0,74,173,0.35)] scale-[1.02]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualSanitize(true);
                  const { saveManualSanitize } = require('@/lib/storage');
                  saveManualSanitize(true);
                  showToast('Manual Sanitization enabled');
                }}
                className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all duration-200 ${
                  manualSanitize
                    ? 'bg-primary text-on-primary shadow-[0_2px_8px_rgba(0,74,173,0.35)] scale-[1.02]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Manual
              </button>
            </div>
          </div>
        </section>

        {/* ── Import/Export Section ────────────────────────────────────── */}
        <section className="bg-white dark:bg-[var(--surface)] rounded-xl border border-outline-variant dark:border-[var(--border)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low/40">
            <h2 className="text-sm font-semibold text-on-surface">Import / Export</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Backup or restore your custom presets.</p>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleExport} disabled={userPresets.length === 0}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Export Presets
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Import Presets
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
        </section>

        {/* ── Data Management Section — alert themed ───────────────────── */}
        <section className="bg-white dark:bg-[var(--surface)] rounded-xl border border-error/15 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-error/10 bg-error/[0.02]">
            <h2 className="text-sm font-semibold text-on-surface">Data Management</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Manage your stored data.</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-on-surface">Clear History</span>
                <p className="text-xs text-on-surface-variant mt-0.5">Remove all sanitization history entries.</p>
              </div>
              <Button variant="danger-outline" size="sm" onClick={() => setShowClearHistoryModal(true)}>Clear</Button>
            </div>
            <div className="border-t border-outline-variant/30" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-on-surface">Clear All Data</span>
                <p className="text-xs text-on-surface-variant mt-0.5">Remove all data including presets, history, and preferences.</p>
              </div>
              <Button variant="danger-outline" size="sm" onClick={() => setShowClearAllModal(true)}>Clear All</Button>
            </div>
          </div>
        </section>

      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <PresetEditorModal
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingPreset(null); }}
        initial={editingPreset}
        onSave={editingPreset?.isDefault ? handleSaveSystemOverride : handleSavePreset}
      />

      {/* Clear History modal — alert themed */}
      <Modal open={showClearHistoryModal} onClose={() => setShowClearHistoryModal(false)} title="Clear History" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setShowClearHistoryModal(false)}>Cancel</Button>
          <Button variant="danger-filled" onClick={handleClearHistory}>Clear History</Button>
        </>}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">This will permanently delete all your history. This action cannot be undone.</p>
        </div>
      </Modal>

      {/* Clear All Data modal — alert themed */}
      <Modal open={showClearAllModal} onClose={() => setShowClearAllModal(false)} title="Clear All Data" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setShowClearAllModal(false)}>Cancel</Button>
          <Button variant="danger-filled" onClick={handleClearAll}>Clear Everything</Button>
        </>}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">This will <strong className="text-on-surface">permanently delete everything</strong> — all presets, history, tabs, and preferences. This cannot be undone.</p>
        </div>
      </Modal>

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-xl bg-inverse-surface text-inverse-on-surface text-sm font-medium shadow-lg" style={{ animation: 'modalSlideUp 0.2s ease-out' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
