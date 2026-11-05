import { createHmac } from "node:crypto";
import { describe, expect, test } from "vitest";
import { isValidSignature } from "./signature";

const KEY = "secret";
const BODY = '{"name":"new_digital_product"}';
const digest = createHmac("sha256", KEY).update(BODY).digest();

describe("isValidSignature", () => {
	test("принимает подпись в hex", () => {
		expect(isValidSignature(BODY, digest.toString("hex"), KEY)).toBe(true);
	});

	test("принимает подпись в base64", () => {
		expect(isValidSignature(BODY, digest.toString("base64"), KEY)).toBe(true);
	});

	test("отклоняет подпись чужим ключом", () => {
		expect(isValidSignature(BODY, digest.toString("hex"), "other")).toBe(false);
	});

	test("отклоняет изменённое тело", () => {
		expect(isValidSignature(`${BODY} `, digest.toString("hex"), KEY)).toBe(
			false,
		);
	});

	test("отклоняет подпись другой длины", () => {
		expect(isValidSignature(BODY, "abc", KEY)).toBe(false);
	});
});
