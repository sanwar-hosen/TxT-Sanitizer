// Static prototype — no functionality, just layout skeleton
// Matches the wireframe: preset tabs (left) + workspace tabs (right) in one row,
// then dual-pane card below.

export default function SanitizerPage() {
  // Static sample presets (3 visible + 1 overflow)
  const presets = [
    { id: "default01", label: "System Default", active: true },
    { id: "default02", label: "Markdown → Plain", active: false },
    { id: "user01",    label: "Default",          active: false, isDropdown: true },
  ];

  // Static workspace tabs
  const tabs = [
    { id: "tab1", label: "Tab 1", active: false },
    { id: "tab2", label: "Tab 2", active: true },
  ];

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-3 px-5 py-4">

      {/* ── Top control row ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">

        {/* LEFT: Preset tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active preset — filled brand button */}
          <button
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-semibold text-white transition shadow-sm"
            style={{ background: "var(--brand)" }}
          >
            System Default
          </button>

          {/* Inactive preset — outlined */}
          <button className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] shadow-[var(--shadow-sm)]">
            Markdown → Plain
          </button>

          {/* Dropdown preset (overflow example — "Default" with chevron) */}
          <div className="relative">
            <button className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] shadow-[var(--shadow-sm)]">
              Default
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* "More" overflow button — shows when presets > 3 */}
          <button
            title="More presets"
            className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] shadow-[var(--shadow-sm)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        {/* RIGHT: Workspace tabs */}
        <div className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-sm)]">
          {/* Inactive tab */}
          <button className="rounded-[4px] px-4 py-1.5 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
            Tab 1
          </button>

          {/* Active tab */}
          <div className="flex items-center gap-1 rounded-[4px] bg-[var(--surface-2)] pl-3 pr-1.5 py-1.5">
            <span className="text-sm font-semibold" style={{ color: "#16a34a" }}>
              Tab 2
            </span>
            <button
              title="Close tab"
              className="ml-0.5 flex h-4 w-4 items-center justify-center rounded text-[var(--text-muted)] opacity-60 hover:bg-red-100 hover:text-red-500 hover:opacity-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Add tab button */}
          <button
            title="Add tab"
            className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--brand)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Main dual-pane card ──────────────────────────────────── */}
      <div
        className="flex flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
        style={{ boxShadow: "var(--shadow-md)", minHeight: "520px" }}
      >

        {/* ── LEFT: Input Panel ──────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col border-r border-[var(--border)]">
          {/* Textarea */}
          <textarea
            readOnly
            placeholder="Paste or type text here..."
            className="flex-1 resize-none bg-transparent px-5 pt-5 pb-2 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] outline-none"
          />

          {/* Input panel footer */}
          <div className="flex items-center justify-between border-t border-[var(--border-light)] px-4 py-3">
            {/* Char + word count */}
            <span className="text-xs text-[var(--text-muted)]">
              0 chars, 0 words
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Paste / Clear icon */}
              <button
                title="Paste from clipboard"
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
              </button>

              {/* Sanitize button */}
              <button
                className="rounded-[var(--radius-sm)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 shadow-sm"
                style={{ background: "var(--brand)" }}
              >
                Sanitize
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Output Panel ────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col">
          {/* Find & Replace trigger icon — top right */}
          <div className="absolute right-3 top-3 z-10">
            <button
              title="Find & Replace"
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>

          {/* Output content area */}
          <div className="flex-1 px-5 pt-5 pb-2 text-sm text-[var(--text-light)]">
            Sanitized output appears here.
          </div>

          {/* Output panel footer */}
          <div className="flex items-center justify-between border-t border-[var(--border-light)] px-4 py-3">
            {/* Spacer left */}
            <span className="text-xs text-[var(--text-muted)]">
              {/* empty — or could show output char count on left in future */}
            </span>

            {/* Char count + matched + action icons */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)]">
                0 chars,{" "}
                <strong className="font-semibold text-[var(--text)]">
                  0 matched segments
                </strong>
              </span>

              {/* Copy output */}
              <button
                title="Copy output"
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>

              {/* Reinput (send output back to input) */}
              <button
                title="Send output back to input"
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 14 4 9l5-5" />
                  <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
