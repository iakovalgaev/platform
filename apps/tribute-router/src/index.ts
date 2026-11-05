import { onShutdown } from "@acme/kit/node";
import { buildServer } from "./server";
import { env } from "./shared/config/env";

const server = buildServer({
	port: env.port,
	logLevel: env.logLevel,
	isDebug: env.nodeEnv === "development",
	lokiUrl: env.lokiUrl,
	apiKey: env.tributeApiKey,
	routes: env.routes,
});
onShutdown(server.stop);
await server.start();
