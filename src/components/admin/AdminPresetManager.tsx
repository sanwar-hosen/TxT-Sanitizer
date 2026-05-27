'use client';

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/shared/Button';
import Modal from '@/components/shared/Modal';

interface Rule {
  priority: number;
  find: string;
  replace: string;
}

interface Preset {
  id: string;
  name: string;
  rules: Rule[];
  isDefault: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  presets: Preset[];
  onRefresh: () => void;
}

const EMPTY_RULE = (): Rule => ({ priority: 1, find: '', replace: '' });

export default function AdminPresetManager({ presets, onRefresh }: Props) {
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Preset | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // ── Open edit / create ────────────────────────────────────────────────────
  function openCreate() {
    setEditingPreset({ id: nanoid(8), name: '', rules: [EMPTY_RULE()], isDefault: true });
    setIsCreating(true);
    setSaveError('');
  }

  function openEdit(preset: Preset) {
    setEditingPreset(JSON.parse(JSON.stringify(preset)));
    setIsCreating(false);
    setSaveError('');
  }

  function closeEdit() {
    setEditingPreset(null);
    setSaveError('');
  }

  // ── Rule helpers ──────────────────────────────────────────────────────────
  function addRule() {
    if (!editingPreset) return;
    const nextPriority = editingPreset.rules.length + 1;
    setEditingPreset({
      ...editingPreset,
      rules: [...editingPreset.rules, { priority: nextPriority, find: '', replace: '' }],
    });
  }

  function removeRule(index: number) {
    if (!editingPreset) return;
    const updated = editingPreset.rules
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, priority: i + 1 }));
    setEditingPreset({ ...editingPreset, rules: updated });
  }

  function updateRule(index: number, field: 'find' | 'replace', value: string) {
    if (!editingPreset) return;
    const updated = editingPreset.rules.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    setEditingPreset({ ...editingPreset, rules: updated });
  }

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!editingPreset) return;
    if (!editingPreset.name.trim()) {
      setSaveError('Preset name is required.');
      return;
    }
    if (editingPreset.rules.some((r) => !r.find.trim())) {
      setSaveError('All rules must have a "Find" value.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const url = isCreating
        ? '/api/admin/presets'
        : `/api/admin/presets/${editingPreset.id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPreset.id,
          name: editingPreset.name.trim(),
          rules: editingPreset.rules,
          isDefault: editingPreset.isDefault,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? 'Failed to save preset.');
        return;
      }

      closeEdit();
      onRefresh();
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [editingPreset, isCreating, onRefresh]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/presets/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteTarget(null);
        onRefresh();
      }
    } catch {
      // silent
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, onRefresh]);

  // ── Export JSON ───────────────────────────────────────────────────────────
  function handleExport() {
    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import JSON ───────────────────────────────────────────────────────────
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const arr = Array.isArray(data) ? data : [data];
        let created = 0;
        let failed = 0;

        for (const preset of arr) {
          if (!preset.id || !preset.name || !Array.isArray(preset.rules)) {
            failed++;
            continue;
          }
          const res = await fetch('/api/admin/presets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: preset.id,
              name: preset.name,
              rules: preset.rules,
              isDefault: preset.isDefault ?? false,
            }),
          });
          if (res.ok) created++;
          else failed++;
        }

        if (created > 0) {
          setImportSuccess(`Imported ${created} preset${created > 1 ? 's' : ''}.`);
          onRefresh();
        }
        if (failed > 0) {
          setImportError(`${failed} preset${failed > 1 ? 's' : ''} failed to import.`);
        }
      } catch {
        setImportError('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-5">
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-base-content/60">
          {presets.length} system preset{presets.length !== 1 ? 's' : ''} in D1
        </p>
        <div className="flex items-center gap-2">
          <label className="btn btn-sm btn-ghost border border-base-300 cursor-pointer gap-1.5 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1.5 text-xs border border-base-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export JSON
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate} className="gap-1.5 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Preset
          </Button>
        </div>
      </div>

      {/* Import feedback */}
      {importSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {importSuccess}
        </div>
      )}
      {importError && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs font-medium text-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {importError}
        </div>
      )}

      {/* Preset list */}
      {presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <p className="mt-3 text-sm font-medium">No presets yet</p>
          <p className="text-xs mt-1">Click "New Preset" to create the first one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3 hover:border-primary/30 hover:bg-base-200/50 transition-all duration-200"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-base-content truncate">{preset.name}</span>
                  {preset.isDefault && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                      System
                    </span>
                  )}
                </div>
                <p className="text-xs text-base-content/50 mt-0.5">
                  {preset.rules.length} rule{preset.rules.length !== 1 ? 's' : ''} · ID: <code className="font-mono">{preset.id}</code>
                  {preset.version && ` · v${preset.version}`}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(preset)}
                  className="text-xs gap-1 h-8 px-2.5 border border-base-300"
                  title="Edit preset"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </Button>
                <Button
                  variant="danger-outline"
                  size="sm"
                  onClick={() => setDeleteTarget(preset)}
                  className="text-xs gap-1 h-8 px-2.5"
                  title="Delete preset"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit / Create Modal ─────────────────────────────────────────────── */}
      <Modal
        open={!!editingPreset}
        onClose={closeEdit}
        title={isCreating ? 'New System Preset' : `Edit: ${editingPreset?.name || ''}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeEdit} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : isCreating ? 'Create Preset' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {editingPreset && (
          <div className="space-y-5">
            {saveError && (
              <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs font-medium text-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {saveError}
              </div>
            )}

            {/* Preset meta */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5">
                  Preset Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editingPreset.name}
                  onChange={(e) => setEditingPreset({ ...editingPreset, name: e.target.value })}
                  placeholder="e.g. ChatGPT → Normal"
                  className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content placeholder-base-content/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5">
                  ID {isCreating ? <span className="text-base-content/40 font-normal">(auto-generated)</span> : ''}
                </label>
                <input
                  type="text"
                  value={editingPreset.id}
                  onChange={(e) => isCreating && setEditingPreset({ ...editingPreset, id: e.target.value })}
                  readOnly={!isCreating}
                  className="w-full rounded-lg border border-base-300 bg-base-200/60 px-3 py-2 text-sm font-mono text-base-content/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault-toggle"
                checked={editingPreset.isDefault}
                onChange={(e) => setEditingPreset({ ...editingPreset, isDefault: e.target.checked })}
                className="checkbox checkbox-primary checkbox-sm"
              />
              <label htmlFor="isDefault-toggle" className="text-sm text-base-content cursor-pointer select-none">
                Mark as system preset (shown to all users)
              </label>
            </div>

            {/* Rules */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold text-base-content/70">
                  Rules <span className="text-base-content/40 font-normal">— applied top to bottom</span>
                </label>
                <Button variant="outline" size="sm" onClick={addRule} className="text-xs gap-1 h-7 px-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Rule
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {editingPreset.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 text-center text-xs font-mono text-base-content/30 shrink-0">
                      {rule.priority}
                    </span>
                    <input
                      type="text"
                      value={rule.find}
                      onChange={(e) => updateRule(index, 'find', e.target.value)}
                      placeholder="Find (literal)"
                      className="flex-1 rounded-lg border border-base-300 bg-base-100 px-3 py-1.5 text-xs font-mono text-base-content placeholder-base-content/30 focus:outline-none focus:border-primary transition-all"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-base-content/30 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                    <input
                      type="text"
                      value={rule.replace}
                      onChange={(e) => updateRule(index, 'replace', e.target.value)}
                      placeholder="Replace (empty = delete)"
                      className="flex-1 rounded-lg border border-base-300 bg-base-100 px-3 py-1.5 text-xs font-mono text-base-content placeholder-base-content/30 focus:outline-none focus:border-primary transition-all"
                    />
                    <button
                      onClick={() => removeRule(index)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-base-300 text-base-content/40 hover:text-error hover:border-error/40 hover:bg-error/5 transition-all duration-200"
                      title="Remove rule"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
                {editingPreset.rules.length === 0 && (
                  <p className="text-center py-4 text-xs text-base-content/40">No rules yet — click "Add Rule" above</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Preset"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger-filled" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-base-content/80">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-base-content">{deleteTarget?.name}</span>?
          This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
