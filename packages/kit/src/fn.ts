import { isNil } from "es-toolkit";

export type NonEmptyArray<T> = readonly [T, ...T[]];

type AllDefined<T> = { [K in keyof T]-?: NonNullable<T[K]> };
type KeysDefined<T, K extends readonly (keyof T)[]> = T & {
	[P in K[number]]-?: NonNullable<T[P]>;
};

export function isDefined<T extends object>(
	obj: T | null | undefined,
): obj is AllDefined<NonNullable<T>>;
export function isDefined<
	T extends object,
	const K extends readonly (keyof T)[],
>(obj: T | null | undefined, ...keys: K): obj is KeysDefined<NonNullable<T>, K>;
export function isDefined(
	obj: Record<PropertyKey, unknown>,
	...keys: PropertyKey[]
) {
	if (isNil(obj)) return false;
	const ks = keys.length ? keys : Object.keys(obj);
	return ks.every((k) => !isNil(obj[k]));
}

export function assertDefined<T extends object>(
	obj: T | null | undefined,
): asserts obj is AllDefined<NonNullable<T>>;
export function assertDefined<
	T extends object,
	const K extends readonly (keyof T)[],
>(
	obj: T | null | undefined,
	...keys: K
): asserts obj is KeysDefined<NonNullable<T>, K>;
export function assertDefined(
	obj: Record<PropertyKey, unknown>,
	...keys: PropertyKey[]
) {
	if (!isDefined(obj, ...keys)) {
		throw new Error("Required properties are missing");
	}
}
