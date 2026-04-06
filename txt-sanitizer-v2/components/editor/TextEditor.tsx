import type { ChangeEvent } from "react";

type TextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSanitize: () => void;
  onPaste: () => void;
  onFileUpload: (fileContent: string) => void;
  isTyping: boolean;
};

export function TextEditor({ value, onChange, onSanitize, onPaste, onFileUpload, isTyping }: TextEditorProps) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("File size must be 1MB or less.");
      event.target.value = "";
      return;
    }

    const isValidType = file.name.endsWith(".txt") || file.name.endsWith(".md");
    if (!isValidType) {
      alert("Only .txt and .md files are supported.");
      event.target.value = "";
      return;
    }

    const content = await file.text();
    onFileUpload(content);
    event.target.value = "";
  }

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#5b6b81]">To rewrite text, enter or paste it here and press Sanitize.</p>
      </div>
      <div className="flex items-center gap-2">
        <label className="cursor-pointer rounded-md border border-[#0b5fcc] bg-white px-3 py-2 text-sm font-medium text-[#0b5fcc]">
          Upload
          <input type="file" accept=".txt,.md" className="hidden" onChange={handleUpload} />
        </label>
        <button
          type="button"
          onClick={onPaste}
          className={`rounded-md border border-[#0b5fcc] bg-white px-3 py-2 text-sm font-medium text-[#0b5fcc] transition-opacity ${
            isTyping ? "opacity-50" : "opacity-100"
          }`}
        >
          Paste
        </button>
        <button
          type="button"
          onClick={onSanitize}
          className={`btn-primary ml-auto rounded-md px-5 py-2 text-sm font-semibold transition-opacity ${
            isTyping ? "opacity-65" : "opacity-100"
          }`}
        >
          Sanitize
        </button>
      </div>
      <textarea
        aria-label="Input text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            onSanitize();
          }
        }}
        rows={14}
        placeholder="Enter or paste text..."
        className="min-h-[340px] w-full resize-y rounded-md border border-[#d4dce6] bg-white p-3 text-sm text-[#1f2a37] outline-none focus:border-[#0b5fcc]"
      />
      <div className="text-right text-sm text-[#4a5f79]">{value.length} Char | {words} Words</div>
    </section>
  );
}
