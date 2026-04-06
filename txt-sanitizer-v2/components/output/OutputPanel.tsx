type OutputPanelProps = {
  value: string;
  matchesCount: number;
  onCopy: () => void;
  onReinput: () => void;
  onFindReplace: () => void;
};

export function OutputPanel({ value, matchesCount, onCopy, onReinput, onFindReplace }: OutputPanelProps) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#5b6b81]">Sanitized text will appear here...</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onFindReplace}
          className="rounded-md border border-[#d1dae5] bg-white px-3 py-2 text-sm text-[#445a75]"
        >
          Find & Replace
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-md border border-[#d1dae5] bg-white px-3 py-2 text-sm text-[#445a75]"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={onReinput}
          className="rounded-md border border-[#d1dae5] bg-white px-3 py-2 text-sm text-[#445a75]"
        >
          Reinput Text
        </button>
      </div>
      <pre
        className="m-0 min-h-[340px] whitespace-pre-wrap rounded-md border border-[#d4dce6] bg-white p-3 text-sm text-[#1f2a37]"
      >
        {value || ""}
      </pre>
      <div className="text-right text-sm font-semibold text-[#3f5672]">
        {value.length} Char | {matchesCount} Matches
      </div>
    </section>
  );
}
