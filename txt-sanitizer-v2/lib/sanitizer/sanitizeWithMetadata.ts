import type { Rule } from "./types";

function normalizeRegexFlags(flags?: string): string {
	const merged = new Set((flags ?? "").split("").filter(Boolean));
	merged.add("g");
	merged.add("i");
	return [...merged].join("");
}

export type Match = {
	original: string;
	replaced: string;
	startIndex: number;
	endIndex: number;
};

export function sanitizeWithMetadata(
	input: string,
	rules: Rule[],
): {
	output: string;
	matches: Match[];
} {
	let output = input;
	const matches: Match[] = [];

	for (const rule of rules) {
		if (!rule.find) continue;

		if (rule.type === "text") {
			let index = 0;

			while (true) {
				index = output.indexOf(rule.find, index);
				if (index === -1) break;

				const original = rule.find;
				const replaced = rule.replace;

				if (original !== replaced) {
					output =
						output.slice(0, index) +
						replaced +
						output.slice(index + original.length);

					matches.push({
						original,
						replaced,
						startIndex: index,
						endIndex: index + replaced.length,
					});

					index += replaced.length;
				} else {
					index += original.length;
				}
			}
		} else {
			let regex: RegExp;

			try {
				regex = new RegExp(rule.find, normalizeRegexFlags(rule.flags));
			} catch {
				continue;
			}

			const globalRegex = regex.global
				? regex
				: new RegExp(regex.source, regex.flags + "g");

			let match: RegExpExecArray | null;

			while ((match = globalRegex.exec(output)) !== null) {
				const start = match.index;
				const original = match[0];
				const replaced = original.replace(regex, rule.replace);

				if (original !== replaced) {
					output =
						output.slice(0, start) +
						replaced +
						output.slice(start + original.length);

					matches.push({
						original,
						replaced,
						startIndex: start,
						endIndex: start + replaced.length,
					});

					globalRegex.lastIndex = start + replaced.length;
				}

				if (original.length === 0) {
					globalRegex.lastIndex += 1;
				}
			}
		}
	}

	return { output, matches };
}
