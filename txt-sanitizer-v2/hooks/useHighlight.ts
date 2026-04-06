export type HighlightRange = {
  startIndex: number;
  endIndex: number;
  kind: "preset" | "search";
};

export function useHighlight() {
  function applyPresetHighlighting(text: string, ranges: HighlightRange[]) {
    if (!text || ranges.length === 0) {
      return [] as HighlightRange[];
    }

    return ranges.filter((range) => range.kind === "preset");
  }

  function applySearchHighlighting(text: string, ranges: HighlightRange[]) {
    if (!text || ranges.length === 0) {
      return [] as HighlightRange[];
    }

    return ranges.filter((range) => range.kind === "search");
  }

  return {
    applyPresetHighlighting,
    applySearchHighlighting,
  };
}
