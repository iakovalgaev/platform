import { attempt } from "@acme/kit";
import { z } from "zod";

export type TributeEvent = {
	name: string;
	productId: string | null;
	purchaseId: string | null;
};

const id = z.union([z.number(), z.string()]).transform(String);
const zEnvelope = z.object({
	name: z.string(),
	payload: z.object({
		product_id: id.optional(),
		purchase_id: id.optional(),
	}),
});

export function readEvent(body: string): TributeEvent | null {
	const json = attempt(() => JSON.parse(body));
	if (!json.ok) return null;
	const parsed = zEnvelope.safeParse(json.value);
	if (!parsed.success) return null;
	const { name, payload } = parsed.data;
	return {
		name,
		productId: payload.product_id ?? null,
		purchaseId: payload.purchase_id ?? null,
	};
}
