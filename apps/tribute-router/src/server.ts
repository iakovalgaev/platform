import { attemptAsync, isNil } from "@acme/kit";
import { createLogger } from "@acme/kit/logger";
import fastify from "fastify";
import { webhookPlugin } from "~/plugins/webhook";
import type { Route } from "~/tribute";

type ServerOptions = {
	port: number;
	logLevel: string;
	isDebug: boolean;
	lokiUrl?: string;
	apiKey: string;
	routes: Route[];
};

export function buildServer(opts: ServerOptions) {
	const { port, logLevel, isDebug, lokiUrl, apiKey, routes } = opts;
	const logger = createLogger({
		app: "tribute-router",
		isDebug,
		logLevel,
		lokiUrl,
	});
	const app = fastify({ loggerInstance: logger, disableRequestLogging: true });

	app.setErrorHandler((error, request, reply) => {
		if (statusCodeOf(error) < 500) return reply.send(error);
		request.log.error({ err: error }, "request-failed");
		return reply
			.code(500)
			.send({ statusCode: 500, error: "Internal Server Error" });
	});

	app.get("/health", () => ({ status: "ok" }));
	void app.register(webhookPlugin, { apiKey, routes });

	const stop = async () => {
		await app.close();
	};
	const start = async () => {
		const result = await attemptAsync(() =>
			app.listen({ port, host: "0.0.0.0" }),
		);
		if (!result.ok) {
			app.log.error({ alert: true, err: result.error }, "server-start-failed");
			process.exit(1);
		}
		app.log.info({ port }, "server-listening");
	};

	return { start, stop };
}

function statusCodeOf(error: unknown): number {
	if (typeof error !== "object" || isNil(error) || !("statusCode" in error)) {
		return 500;
	}
	return typeof error.statusCode === "number" ? error.statusCode : 500;
}
