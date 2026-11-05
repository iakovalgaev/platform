import { attempt } from "@acme/kit";
import { parseEnv, zodEnvOptionalUrl } from "@acme/kit/env";
import { z } from "zod";
import { zRoutes } from "~/tribute";

const zRoutesEnv = z
	.string()
	.transform((value, ctx) => {
		const json = attempt(() => JSON.parse(value));
		if (json.ok) return json.value;
		ctx.addIssue({ code: "custom", message: "TRIBUTE_ROUTES is not JSON" });
		return z.NEVER;
	})
	.pipe(zRoutes);

const schema = z
	.object({
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		PORT: z.coerce.number().default(8000),
		TRIBUTE_API_KEY: z.string().min(1),
		TRIBUTE_ROUTES: zRoutesEnv,
		LOG_LEVEL: z
			.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
			.default("info"),
		LOKI_URL: zodEnvOptionalUrl(),
	})
	.transform((input) => ({
		nodeEnv: input.NODE_ENV,
		port: input.PORT,
		tributeApiKey: input.TRIBUTE_API_KEY,
		routes: input.TRIBUTE_ROUTES,
		logLevel: input.LOG_LEVEL,
		lokiUrl: input.LOKI_URL,
	}));

export const env = parseEnv(schema, "@acme/tribute-router");
