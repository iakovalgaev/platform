export type AttemptResult<T> =
	| { ok: true; value: T }
	| { ok: false; error: unknown };

export function attempt<T>(fn: () => T): AttemptResult<T> {
	try {
		return { ok: true, value: fn() };
	} catch (error) {
		return { ok: false, error };
	}
}

export async function attemptAsync<T>(
	fn: () => Promise<T>,
): Promise<AttemptResult<T>> {
	try {
		return { ok: true, value: await fn() };
	} catch (error) {
		return { ok: false, error };
	}
}
