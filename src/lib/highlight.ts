import type { Match } from '@/types/preset';

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
  match?: Match;
}

/**
 * Splits the output string into alternating unhighlighted and highlighted segments
 * based on the provided match positions.
 */
export function buildHighlightSegments(text: string, matches: Match[]): HighlightSegment[] {
  if (!matches || matches.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Sort matches by start index to process sequentially
  const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const match of sortedMatches) {
    // There could be overlapping matches, so ensure we only move forward
    if (match.startIndex < cursor) continue;

    if (match.startIndex > cursor) {
      // Add unhighlighted text before the match
      segments.push({
        text: text.slice(cursor, match.startIndex),
        isMatch: false,
      });
    }

    segments.push({
      text: text.slice(match.startIndex, match.endIndex),
      isMatch: true,
      match: match,
    });
    
    cursor = Math.max(cursor, match.endIndex);
  }

  // Add any remaining unhighlighted text
  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      isMatch: false,
    });
  }

  return segments;
}
