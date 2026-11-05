import { delay } from "es-toolkit";

export function createThrottle(params: {
	perSecond: number;
}): () => Promise<void> {
	const intervalMs = 1000 / params.perSecond;
	let nextFreeAt = 0;

	return async () => {
		const now = Date.now();
		const scheduledAt = Math.max(now, nextFreeAt);
		nextFreeAt = scheduledAt + intervalMs;
		const waitMs = scheduledAt - now;
		if (waitMs > 0) await delay(waitMs);
	};
}
