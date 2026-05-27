import type { Match, SanitizeResult, ExemptRange } from '@/types/preset';

/**
 * Restores a specific match back to its original text.
 * Updates the output string and the remaining match offsets.
 */
export function restoreMatch(
  currentOutput: string,
  currentMatches: Match[],
  matchToRestore: Match
): SanitizeResult {
  const { startIndex, endIndex, original } = matchToRestore;

  // 1. Replace the output string
  const newOutput =
    currentOutput.slice(0, startIndex) +
    original +
    currentOutput.slice(endIndex);

  // 2. Calculate the length difference
  const diff = original.length - (endIndex - startIndex);

  // 3. Update remaining matches
  // - Remove the restored match
  // - Shift the indices of all subsequent matches by `diff`
  const newMatches = currentMatches
    .filter((m) => m !== matchToRestore) // Reference equality check
    .map((m) => {
      if (m.startIndex >= endIndex) {
        return {
          ...m,
          startIndex: m.startIndex + diff,
          endIndex: m.endIndex + diff,
        };
      }
      return m;
    });

  return { output: newOutput, matches: newMatches };
}

/**
 * Adjusts exempt range offsets when the input text is edited.
 * Uses a prefix-suffix diffing heuristic to shift subsequent ranges
 * and discards ranges that were directly modified.
 */
export function shiftExemptRanges(
  oldText: string,
  newText: string,
  exemptRanges?: ExemptRange[]
): ExemptRange[] {
  if (!exemptRanges || exemptRanges.length === 0) return [];
  if (oldText === newText) return exemptRanges;

  // Find common prefix length
  let prefixLen = 0;
  const minLen = Math.min(oldText.length, newText.length);
  while (prefixLen < minLen && oldText[prefixLen] === newText[prefixLen]) {
    prefixLen++;
  }

  // Find common suffix length, ensuring we don't overlap with the prefix
  let suffixLen = 0;
  const maxSuffixLen = minLen - prefixLen;
  while (
    suffixLen < maxSuffixLen &&
    oldText[oldText.length - 1 - suffixLen] === newText[newText.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const diff = newText.length - oldText.length;
  const deletedStart = prefixLen;
  const deletedEnd = oldText.length - suffixLen;

  const shiftedRanges: ExemptRange[] = [];

  for (const range of exemptRanges) {
    // If the range is entirely before the edited region (in the unchanged prefix)
    if (range.endIndex <= deletedStart) {
      if (newText.slice(range.startIndex, range.endIndex) === range.original) {
        shiftedRanges.push(range);
      }
    }
    // If the range is entirely after the edited region (in the unchanged suffix)
    else if (range.startIndex >= deletedEnd) {
      const newStart = range.startIndex + diff;
      const newEnd = range.endIndex + diff;
      if (newStart >= 0 && newEnd <= newText.length) {
        if (newText.slice(newStart, newEnd) === range.original) {
          shiftedRanges.push({
            startIndex: newStart,
            endIndex: newEnd,
            original: range.original,
          });
        }
      }
    }
    // Overlapping / modified ranges are discarded
  }

  return shiftedRanges;
}
