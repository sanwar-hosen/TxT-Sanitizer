import type { Rule } from "./types";

function normalizeRegexFlags(flags?: string): string {
	const merged = new Set((flags ?? "").split("").filter(Boolean));
	merged.add("g");
	merged.add("i");
	return [...merged].join("");
}

export function sanitizeText(input: string, rules: Rule[]): string {
	return rules.reduce((result, rule) => {
		if (!rule.find) return result;

		if (rule.type === "text") {
			return result.split(rule.find).join(rule.replace);
		}

		try {
			const regex = new RegExp(rule.find, normalizeRegexFlags(rule.flags));
			return result.replace(regex, rule.replace);
		} catch {
			return result;
		}
	}, input);
}
