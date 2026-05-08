import type { Match, Rule, SanitizeResult } from '@/types/preset';

interface Segment {
  text: string;
  match?: {
    original: string;
    rulePriority: number;
  };
}

export function sanitize(text: string, rules: Rule[]): SanitizeResult {
  if (!text || rules.length === 0) {
    return { output: text, matches: [] };
  }

  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  let segments: Segment[] = [{ text }];

  for (const rule of sorted) {
    if (!rule.find) continue;

    const newSegments: Segment[] = [];
    
    for (const seg of segments) {
      const parts = seg.text.split(rule.find);
      
      if (parts.length === 1) {
        newSegments.push(seg);
        continue;
      }
      
      for (let i = 0; i < parts.length; i++) {
        // Only push non-empty text parts, UNLESS the original text was somehow empty (shouldn't happen)
        // Actually, if we push empty parts, it might create useless empty segments. But we need to maintain structure.
        // It's safe to skip empty parts.
        if (parts[i].length > 0) {
          newSegments.push({
            text: parts[i],
            match: seg.match
          });
        }
        
        // Between parts, insert the replacement
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
  let cursor = 0;

  for (const seg of segments) {
    const startIndex = cursor;
    currentOutput += seg.text;
    cursor += seg.text.length;
    const endIndex = cursor;

    if (seg.match) {
      finalMatches.push({
        original: seg.match.original,
        replaced: seg.text,
        startIndex,
        endIndex,
        rulePriority: seg.match.rulePriority
      });
    }
  }

  // Merge adjacent un-matched text segments and adjacent matches of the SAME type to clean up the output?
  // It's actually fine as is, `buildHighlightSegments` handles sorting and gap filling.
  // Wait! If there are two adjacent matches, `buildHighlightSegments` will render them separately. That's fine.

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
