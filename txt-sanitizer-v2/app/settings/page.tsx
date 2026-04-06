"use client";

import { useState } from "react";
import { clearAllData, clearHistory, loadUserPresets, saveUserPresets, type UserPreset } from "@/lib/storage";

export default function SettingsPage() {
  const [presets, setPresets] = useState<UserPreset[]>(() => loadUserPresets());
  const [presetName, setPresetName] = useState("");
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");

  function persist(next: UserPreset[]) {
    saveUserPresets(next);
    setPresets(next);
  }

  function addPreset() {
    if (!presetName.trim() || !findValue.trim()) {
      alert("Preset name and find value are required.");
      return;
    }

    const next: UserPreset[] = [
      ...presets,
      {
        id: `user-${Date.now()}`,
        name: presetName.trim(),
        rules: [
          {
            type: "text",
            find: findValue,
            replace: replaceValue,
          },
        ],
      },
    ];

    persist(next);
    setPresetName("");
    setFindValue("");
    setReplaceValue("");
  }

  function removePreset(id: string) {
    persist(presets.filter((item) => item.id !== id));
  }

  return (
    <section className="panel-shell mx-auto grid max-w-[1320px] gap-5 p-4">
      <h1 className="text-2xl font-semibold text-[#1f2a37]">Settings</h1>

      <article className="rounded-md border border-[#d4dce6] bg-white p-4">
        <h2 className="text-lg font-semibold text-[#1f2a37]">Manage User Presets</h2>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            placeholder="Preset name"
            className="rounded-md border border-[#cfd9e4] px-3 py-2 text-sm outline-none focus:border-[#0b5fcc]"
          />
          <input
            value={findValue}
            onChange={(event) => setFindValue(event.target.value)}
            placeholder="Find"
            className="rounded-md border border-[#cfd9e4] px-3 py-2 text-sm outline-none focus:border-[#0b5fcc]"
          />
          <input
            value={replaceValue}
            onChange={(event) => setReplaceValue(event.target.value)}
            placeholder="Replace"
            className="rounded-md border border-[#cfd9e4] px-3 py-2 text-sm outline-none focus:border-[#0b5fcc]"
          />
        </div>

        <button type="button" onClick={addPreset} className="btn-primary mt-3 rounded-md px-4 py-2 text-sm font-semibold">
          Add Preset
        </button>

        <div className="mt-4 grid gap-2">
          {presets.length === 0 ? (
            <p className="text-sm text-[#5b6b81]">No user presets yet.</p>
          ) : (
            presets.map((preset) => (
              <div key={preset.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#d9e1ea] p-3">
                <div className="text-sm text-[#334155]">{preset.name}</div>
                <button
                  type="button"
                  onClick={() => removePreset(preset.id)}
                  className="rounded border border-[#efc0c0] px-3 py-1 text-sm text-[#b42323]"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="rounded-md border border-[#d4dce6] bg-white p-4">
        <h2 className="text-lg font-semibold text-[#1f2a37]">Storage Management</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              clearHistory();
              alert("History cleared.");
            }}
            className="rounded-md border border-[#f0c089] px-4 py-2 text-sm font-semibold text-[#b45309]"
          >
            Clear History
          </button>
          <button
            type="button"
            onClick={() => {
              clearAllData();
              setPresets([]);
              alert("All local data cleared.");
            }}
            className="rounded-md border border-[#efc0c0] px-4 py-2 text-sm font-semibold text-[#b42323]"
          >
            Clear All Data
          </button>
        </div>
      </article>
    </section>
  );
}
