import { z } from "zod";

export function parseEnv<T extends z.ZodType>(
	schema: T,
	label: string,
): z.infer<T> {
	const result = schema.safeParse(process.env);
	if (result.success) return result.data;

	console.error(`❌ ${label}: invalid environment variables`);
	for (const issue of result.error.issues) {
		console.error(`▶️  ${issue.path.join(".")}: ${issue.message}`);
	}
	process.exit(1);
}

export function zodEnvOptionalUrl() {
	return z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.url().optional(),
	);
}

export function zodEnvBoolean(defaultValue: boolean) {
	return z.preprocess(
		parseEnvBoolean,
		z.boolean().optional().default(defaultValue),
	);
}

function parseEnvBoolean(v: unknown): boolean | unknown {
	if (v === "false" || v === "0") return false;
	if (v === "true" || v === "1") return true;
	return v;
}
