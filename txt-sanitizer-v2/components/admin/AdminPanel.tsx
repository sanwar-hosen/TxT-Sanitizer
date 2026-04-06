export function AdminPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-[#d4dce6] bg-white p-4">
        <h2 className="text-base font-semibold text-[#1f2a37]">System Presets</h2>
        <p className="mt-2 text-sm text-[#5b6b81]">CRUD controls for global presets will be wired to /api/presets.</p>
      </section>

      <section className="rounded-xl border border-[#d4dce6] bg-white p-4">
        <h2 className="text-base font-semibold text-[#1f2a37]">Popup Configuration</h2>
        <p className="mt-2 text-sm text-[#5b6b81]">Content, enabled state, and trigger type will be wired to /api/popup.</p>
      </section>

      <section className="rounded-xl border border-[#d4dce6] bg-white p-4">
        <h2 className="text-base font-semibold text-[#1f2a37]">Feedback Receiver</h2>
        <p className="mt-2 text-sm text-[#5b6b81]">Recipient settings will be wired to /api/feedback integration config.</p>
      </section>

      <section className="rounded-xl border border-[#d4dce6] bg-white p-4">
        <h2 className="text-base font-semibold text-[#1f2a37]">Analytics</h2>
        <p className="mt-2 text-sm text-[#5b6b81]">Lightweight counters and usage summaries will appear here.</p>
      </section>
    </div>
  );
}
