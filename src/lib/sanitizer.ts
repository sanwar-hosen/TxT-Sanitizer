import type { Match, Rule, SanitizeResult, ExemptRange } from '@/types/preset';

interface Segment {
  text: string;
  isExempt?: boolean;
  match?: {
    original: string;
    rulePriority: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true if the string contains at least one alphabetic character. */
function hasAlpha(str: string): boolean {
  return /[a-zA-Z]/.test(str);
}

/** Escapes special regex characters in a string for safe use in RegExp. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns true if the alphabetic characters (lowercased) of `find` and `replace`
 * are identical — meaning the replacement is a structural modification
 * (e.g. a dash inserted) rather than a completely different word.
 *
 * Examples:
 *   isStructural("pay", "pa-y")  → true   (same alpha: "pay" === "pay")
 *   isStructural("pay", "p-ay")  → true   (same alpha: "pay" === "pay")
 *   isStructural("pay", "abcd")  → false  ("pay" !== "abcd")
 */
function isStructural(find: string, replace: string): boolean {
  const alphaOnly = (s: string) => s.replace(/[^a-zA-Z]/g, '').toLowerCase();
  return alphaOnly(find) === alphaOnly(replace);
}

/**
 * Maps the casing of alphabetic characters from `matched` onto the
 * corresponding alphabetic characters in `template`, leaving non-alpha
 * characters in `template` (like dashes) untouched.
 *
 * Examples:
 *   applyCase("PAY",  "pa-y") → "PA-Y"
 *   applyCase("Pay",  "pa-y") → "Pa-y"
 *   applyCase("pAy",  "pa-y") → "pA-y"
 *   applyCase("pay",  "pa-y") → "pa-y"
 */
function applyCase(matched: string, template: string): string {
  const matchedAlpha = matched.replace(/[^a-zA-Z]/g, '');
  let alphaIdx = 0;
  return template
    .split('')
    .map((ch) => {
      if (/[a-zA-Z]/.test(ch)) {
        const src = matchedAlpha[alphaIdx] ?? ch;
        alphaIdx++;
        return src === src.toUpperCase() ? ch.toUpperCase() : ch.toLowerCase();
      }
      return ch;
    })
    .join('');
}

// ── Main sanitize function ────────────────────────────────────────────────────

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

    if (!hasAlpha(rule.find)) {
      // ── Original path: exact literal case-sensitive match ─────────────────
      // Used for rules whose `find` has no alphabetic characters (e.g. * → -, --> → —)
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
            newSegments.push({ text: parts[i], match: seg.match });
          }
          if (i < parts.length - 1) {
            newSegments.push({
              text: rule.replace,
              match: {
                original: rule.find,
                rulePriority: rule.priority,
              },
            });
          }
        }
      }
    } else {
      // ── New path: case-insensitive match + smart case-preserving replace ──
      // Used for rules whose `find` contains alphabetic characters.
      //
      // If the replacement is a structural modification (same alpha chars as find,
      // e.g. "pa-y" from "pay"), casing of the matched text is preserved.
      // If the replacement is a completely different word (e.g. "abcd"), the
      // literal replacement is used regardless of the matched casing.
      const regex = new RegExp(escapeRegex(rule.find), 'gi');
      const structural = isStructural(rule.find, rule.replace);

      for (const seg of segments) {
        if (seg.isExempt) {
          newSegments.push(seg);
          continue;
        }

        const segText = seg.text;
        let cursor = 0;
        let regexMatch: RegExpExecArray | null;
        regex.lastIndex = 0;
        let hadMatch = false;

        while ((regexMatch = regex.exec(segText)) !== null) {
          hadMatch = true;
          const matchedText = regexMatch[0];
          const matchStart = regexMatch.index;
          const matchEnd = matchStart + matchedText.length;

          // Push unmatched text before this match
          if (matchStart > cursor) {
            newSegments.push({
              text: segText.slice(cursor, matchStart),
              match: seg.match,
            });
          }

          // Determine the actual replacement text:
          // - Structural: mirror casing from the matched token onto the template
          // - Non-structural: use literal replacement as-is
          const actualReplacement = structural
            ? applyCase(matchedText, rule.replace)
            : rule.replace;

          newSegments.push({
            text: actualReplacement,
            match: {
              original: matchedText, // store the actual matched text (e.g. "PAY"), not rule.find
              rulePriority: rule.priority,
            },
          });

          cursor = matchEnd;
        }

        if (!hadMatch) {
          newSegments.push(seg);
        } else if (cursor < segText.length) {
          // Push remaining unmatched text after the last match
          newSegments.push({ text: segText.slice(cursor), match: seg.match });
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
        inputEndIndex: inEnd,
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
