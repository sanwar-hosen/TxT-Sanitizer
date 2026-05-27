import type { Match, Rule, SanitizeResult, ExemptRange } from '@/types/preset';

interface Segment {
  text: string;
  isExempt?: boolean;
  match?: {
    original: string;
    rulePriority: number;
  };
}

export function sanitize(
  text: string,
  rules: Rule[],
  exemptRanges?: ExemptRange[]
): SanitizeResult {
  if (!text) {
    return { output: text, matches: [] };
  }
  if (rules.length === 0) {
    return { output: text, matches: [] };
  }

  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  // Initialize segments by splitting text by valid exempt ranges
  let segments: Segment[] = [];
  const validExempt = (exemptRanges ?? [])
    .filter((r) => r.startIndex >= 0 && r.endIndex <= text.length && r.startIndex < r.endIndex)
    .sort((a, b) => a.startIndex - b.startIndex);

  let lastIndex = 0;
  for (const range of validExempt) {
    if (range.startIndex > lastIndex) {
      segments.push({ text: text.slice(lastIndex, range.startIndex) });
    }
    if (range.startIndex >= lastIndex) {
      segments.push({
        text: text.slice(range.startIndex, range.endIndex),
        isExempt: true,
      });
      lastIndex = range.endIndex;
    }
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments = [{ text }];
  }

  for (const rule of sorted) {
    if (!rule.find) continue;

    const newSegments: Segment[] = [];
    
    for (const seg of segments) {
      if (seg.isExempt) {
        newSegments.push(seg);
        continue;
      }

      const parts = seg.text.split(rule.find);
      
      if (parts.length === 1) {
        newSegments.push(seg);
        continue;
      }
      
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].length > 0) {
          newSegments.push({
            text: parts[i],
            match: seg.match
          });
        }
        
        if (i < parts.length - 1) {
          newSegments.push({
            text: rule.replace,
            match: {
              original: rule.find,
              rulePriority: rule.priority
            }
          });
        }
      }
    }
    
    segments = newSegments;
  }

  // Flatten segments and compute final matches with accurate byte offsets
  let currentOutput = '';
  const finalMatches: Match[] = [];
  let inputCursor = 0;
  let outputCursor = 0;

  for (const seg of segments) {
    const outStart = outputCursor;
    currentOutput += seg.text;
    outputCursor += seg.text.length;
    const outEnd = outputCursor;

    const inStart = inputCursor;
    const inLen = seg.match ? seg.match.original.length : seg.text.length;
    inputCursor += inLen;
    const inEnd = inputCursor;

    if (seg.match) {
      finalMatches.push({
        original: seg.match.original,
        replaced: seg.text,
        startIndex: outStart,
        endIndex: outEnd,
        rulePriority: seg.match.rulePriority,
        inputStartIndex: inStart,
        inputEndIndex: inEnd
      });
    }
  }

  return { output: currentOutput, matches: finalMatches };
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countChars(text: string): number {
  return text.length;
}
