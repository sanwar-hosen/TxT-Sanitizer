import { useState } from "react";
import type { Rule } from "../lib/sanitizer/types";
import { sanitizeWithMetadata } from "../lib/sanitizer/sanitizeWithMetadata";

export function useSanitizer() {
  const [outputText, setOutputText] = useState("");

  function sanitize(input: string, rules: Rule[]) {
    const result = sanitizeWithMetadata(input, rules);
    setOutputText(result.output);
    return result;
  }

  function clearOutput() {
    setOutputText("");
  }

  return {
    outputText,
    sanitize,
    clearOutput,
  };
}
