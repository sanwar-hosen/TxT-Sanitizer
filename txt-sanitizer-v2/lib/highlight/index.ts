export type HighlightToken = {
  startIndex: number;
  endIndex: number;
  kind: "preset" | "search";
};

export function buildHighlightTokens(): HighlightToken[] {
  return [];
}
