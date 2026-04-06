export type RestoreSegment = {
  original: string;
  replaced: string;
  startIndex: number;
  endIndex: number;
};

export function restoreSegment(text: string, segment: RestoreSegment) {
  if (segment.startIndex < 0 || segment.endIndex > text.length || segment.startIndex >= segment.endIndex) {
    return text;
  }

  return text.slice(0, segment.startIndex) + segment.original + text.slice(segment.endIndex);
}
