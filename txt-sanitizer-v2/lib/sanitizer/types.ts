export type RuleType = "text" | "regex";

export interface BaseRule {
	type: RuleType;
	find: string;
	replace: string;
}

export interface TextRule extends BaseRule {
	type: "text";
}

export interface RegexRule extends BaseRule {
	type: "regex";
	flags?: string;
}

export type Rule = TextRule | RegexRule;
