import type { Match } from '@/types/preset';

export function performReplace(
  text: string,
  presetMatches: Match[],
  startIndex: number,
  endIndex: number,
  replacement: string
): { newText: string; newPresetMatches: Match[] } {
  const newText = text.slice(0, startIndex) + replacement + text.slice(endIndex);
  const diff = replacement.length - (endIndex - startIndex);

  const newPresetMatches: Match[] = [];

  for (const pm of presetMatches) {
    // If the replaced segment completely envelops the preset match, we can either
    // remove the preset match or leave it. Usually we remove it because it's replaced.
    if (startIndex <= pm.startIndex && endIndex >= pm.endIndex) {
      continue; // it was overwritten by user
    }

    // If the replaced segment is completely before the preset match, shift the preset match
    if (endIndex <= pm.startIndex) {
      newPresetMatches.push({
        ...pm,
        startIndex: pm.startIndex + diff,
        endIndex: pm.endIndex + diff,
      });
      continue;
    }

    // If there's partial overlap, or the preset match contains the replacement
    // we just adjust the boundaries if necessary
    let newStart = pm.startIndex;
    let newEnd = pm.endIndex;

    if (startIndex < pm.startIndex) {
      newStart = Math.max(startIndex + replacement.length, pm.startIndex + diff);
    }
    
    if (startIndex < pm.endIndex) {
      newEnd = pm.endIndex + diff;
    }

    if (newEnd > newStart) {
      newPresetMatches.push({ ...pm, startIndex: newStart, endIndex: newEnd });
    }
  }

  return { newText, newPresetMatches };
}
