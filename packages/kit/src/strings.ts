import { words } from "es-toolkit";

export { escape as escapeHtml, unescape as unescapeHtml } from "es-toolkit";

/**
 * Normalizes whitespace: collapses multiple spaces into one,
 * trims leading/trailing spaces, and fixes punctuation spacing.
 *
 * @example
 * normalizeWhitespace("  hello    world  ") // "hello world"
 * normalizeWhitespace("hello , world !") // "hello, world!"
 * normalizeWhitespace("( test )") // "(test)"
 */
export function normalizeWhitespace(text: string): string {
	return text
		.trim()
		.replace(/[\s\n\r\t\v\0]+/g, " ")
		.replace(/\s+([,.!?:;)])/g, "$1")
		.replace(/\(\s+/g, "(");
}

/**
 * Replaces specified characters with spaces, collapsing consecutive
 * occurrences into one. Trims leading and trailing occurrences.
 *
 * @example
 * collapseChars("--hello--world--", "-") // "hello world"
 * collapseChars("**!!hello!!**", ["*", "!"]) // "hello"
 */
export function collapseChars(str: string, chars: string | string[]): string {
	const charsArray = Array.isArray(chars) ? chars : [chars];
	const charsSet = new Set(charsArray);

	let result = "";
	let hasContent = false;
	let pendingSpace = false;

	for (const char of str) {
		if (charsSet.has(char)) {
			if (hasContent) {
				pendingSpace = true;
			}
		} else {
			if (pendingSpace) {
				result += " ";
				pendingSpace = false;
			}
			result += char;
			hasContent = true;
		}
	}

	return result;
}

/**
 * Normalizes Cyrillic text: converts "ё" to "е" and "Ё" to "Е".
 *
 * @example
 * normalizeCyrillic("ёлка") // "елка"
 * normalizeCyrillic("Ёжик") // "Ежик"
 */
export function normalizeCyrillic(text: string): string {
	return text.replace(/ё/g, "е").replace(/Ё/g, "Е");
}

/**
 * Normalizes Russian text: splits into words, lowercases,
 * normalizes Cyrillic, and joins with single spaces.
 *
 * @example
 * normalizeRussianText("  Привёт   МИР  ") // "привет мир"
 * normalizeRussianText("Ёлка") // "елка"
 */
export function normalizeRussianText(text: string): string {
	return words(text)
		.map((word) => normalizeCyrillic(word.toLowerCase()))
		.join(" ");
}

/**
 * Checks if string is non-empty after trimming whitespace.
 *
 * @example
 * isEmptyString("hello") // false
 * isEmptyString("  ") // true
 */
export function isEmptyString(text: string): boolean {
	return text.trim().length === 0;
}

const DAY_FORMS = ["день", "дня", "дней"] as const;

export function pluralizeDays(count: number) {
	const mod100 = count % 100;
	const mod10 = count % 10;
	if (mod100 >= 11 && mod100 <= 14) return DAY_FORMS[2];
	if (mod10 === 1) return DAY_FORMS[0];
	if (mod10 >= 2 && mod10 <= 4) return DAY_FORMS[1];
	return DAY_FORMS[2];
}
