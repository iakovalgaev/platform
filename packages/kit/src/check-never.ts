export function checkNever(
	value: never,
	msg = `Unhandled value: ${JSON.stringify(value)}`,
): never {
	throw new Error(msg);
}
