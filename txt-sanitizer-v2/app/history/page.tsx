"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteHistoryEntry, loadHistory, type HistoryEntry } from "@/lib/storage";

export default function HistoryPage() {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());

  const sortedHistory = useMemo(() => {
    const cloned = [...history];
    cloned.sort((a, b) => {
      return sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });
    return cloned;
  }, [history, sortOrder]);

  function handleDelete(id: string) {
    const next = deleteHistoryEntry(id);
    setHistory(next);
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Copy failed in this browser session.");
    }
  }

  function handleEdit(entry: HistoryEntry) {
    sessionStorage.setItem(
      "txt_sanitizer_edit_payload",
      JSON.stringify({
        inputText: entry.input,
        selectedPresetId: entry.presetId,
      }),
    );
    router.push("/");
  }

  return (
    <section className="panel-shell mx-auto grid max-w-[1320px] gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#1f2a37]">History</h1>
        <button
          type="button"
          className="rounded-md border border-[#d0d9e4] bg-white px-3 py-2 text-sm text-[#465b76]"
          onClick={() => setSortOrder((current) => (current === "newest" ? "oldest" : "newest"))}
        >
          Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
        </button>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="rounded-md border border-[#d4dce6] bg-white p-5 text-sm text-[#5b6b81]">
          No history yet. Sanitized results will appear here.
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedHistory.map((entry) => (
            <article key={entry.id} className="rounded-md border border-[#d4dce6] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="grid gap-1 text-sm">
                  <div className="font-semibold text-[#1f2a37]">{entry.presetName}</div>
                  <div className="text-[#64748b]">{new Date(entry.timestamp).toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-[#d0d9e4] px-3 py-1.5 text-sm text-[#445a75]"
                    onClick={() => handleCopy(entry.output)}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[#d0d9e4] px-3 py-1.5 text-sm text-[#445a75]"
                    onClick={() => handleEdit(entry)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[#efc0c0] px-3 py-1.5 text-sm text-[#b42323]"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-[#41556e]">{entry.output}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
