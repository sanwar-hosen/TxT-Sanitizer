import type { Match, SanitizeResult } from '@/types/preset';

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
