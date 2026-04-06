export default function AboutPage() {
  return (
    <section className="panel-shell mx-auto grid max-w-[1320px] gap-6 p-6">
      <header className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#1f2a37]">TxT Sanitizer</h1>
        <p className="text-sm text-[#5b6b81]">
          TxT Sanitizer helps clean and normalize text using preset-based rule pipelines, with history and settings tools built
          for fast everyday use.
        </p>
      </header>

      <article className="rounded-md border border-[#d4dce6] bg-white p-4">
        <h2 className="text-xl font-semibold text-[#1f2a37]">Features</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-[#41556e]">
          <li>Rule-based sanitization with text and regex replacements.</li>
          <li>Multiple workspace tabs with isolated input/output/preset state.</li>
          <li>History tracking for previous sanitization results.</li>
          <li>User preset management with local storage persistence.</li>
          <li>Keyboard shortcut support for fast sanitize flow.</li>
        </ul>
      </article>

      <article className="rounded-md border border-[#d4dce6] bg-white p-4">
        <h2 className="text-xl font-semibold text-[#1f2a37]">How to Use</h2>
        <ol className="mt-2 list-decimal pl-5 text-sm text-[#41556e]">
          <li>Select a preset from the mode list.</li>
          <li>Enter or paste text into the input editor.</li>
          <li>Run sanitize with the button or Ctrl+Enter.</li>
          <li>Copy output, or re-input it for another pass.</li>
        </ol>
      </article>

      <article className="rounded-md border border-[#d4dce6] bg-white p-4">
        <h2 className="text-xl font-semibold text-[#1f2a37]">Technical Details</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-[#41556e]">
          <li>Framework: Next.js App Router with client-first sanitizer workflow.</li>
          <li>Styling: Tailwind CSS with lightweight design tokens.</li>
          <li>Persistence: localStorage for user presets and history.</li>
          <li>Backend contracts: API routes for presets, popup, and feedback.</li>
        </ul>
      </article>

      <article className="rounded-md border border-[#d4dce6] bg-white p-4">
        <h2 className="text-xl font-semibold text-[#1f2a37]">Future Features &amp; Roadmap</h2>
        <p className="mt-2 text-sm text-[#41556e]">
          The roadmap includes improved highlight and restore interactions, richer preset management controls, and full admin
          integration over stable API contracts.
        </p>
      </article>
    </section>
  );
}
