import { attemptAsync } from "../attempt";

type Options = { deadlineMs?: number };

const DEFAULT_DEADLINE_MS = 9_000;

export function onShutdown(
	cleanUp: () => Promise<void>,
	options: Options = {},
): void {
	let isShuttingDown = false;

	const stop = async () => {
		if (isShuttingDown) return;
		isShuttingDown = true;
		const deadline = options.deadlineMs ?? DEFAULT_DEADLINE_MS;
		setTimeout(() => process.exit(1), deadline).unref();
		const cleaned = await attemptAsync(cleanUp);
		process.exit(cleaned.ok ? 0 : 1);
	};

	process.on("SIGINT", stop);
	process.on("SIGTERM", stop);
}
