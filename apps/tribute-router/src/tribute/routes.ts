import { z } from "zod";

export type Route = { name: string; url: string; productIds: string[] };

export const zRoutes = z
	.array(
		z.object({
			name: z.string().regex(/^[a-z0-9-]+$/),
			url: z.url(),
			productIds: z.array(z.string().min(1)).min(1),
		}),
	)
	.min(1)
	.superRefine((routes, ctx) => {
		const names = routes.map((route) => route.name);
		const productIds = routes.flatMap((route) => route.productIds);
		if (hasDuplicates(names)) {
			ctx.addIssue({ code: "custom", message: "Duplicate route name" });
		}
		if (hasDuplicates(productIds)) {
			ctx.addIssue({ code: "custom", message: "Duplicate product id" });
		}
	});

export function findRoute(routes: Route[], productId: string): Route | null {
	return routes.find((route) => route.productIds.includes(productId)) ?? null;
}

function hasDuplicates(values: string[]): boolean {
	return new Set(values).size !== values.length;
}
