import { pino, type TransportTargetOptions } from "pino";

type Config = {
	app: string;
	isDebug: boolean;
	logLevel: string;
	lokiUrl?: string;
};

export type Logger = ReturnType<typeof createLogger>;

export function createLogger(config: Config) {
	return pino({
		level: config.logLevel,
		base: null,
		transport: {
			targets: buildTargets(config),
		},
	});
}

function buildTargets(config: Config): TransportTargetOptions[] {
	if (config.isDebug) {
		return [
			{
				target: "pino-pretty",
				level: config.logLevel,
				options: {
					ignore: "pid,hostname",
					colorize: true,
					translateTime: true,
				},
			},
		];
	}

	const stdout: TransportTargetOptions = {
		target: "pino/file",
		level: config.logLevel,
		options: {},
	};

	if (config.lokiUrl) {
		return [
			stdout,
			{
				target: "pino-loki",
				level: config.logLevel,
				options: {
					host: config.lokiUrl,
					labels: { app: config.app },
					batching: { interval: 5 },
				},
			},
		];
	}

	return [stdout];
}
