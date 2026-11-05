import { attemptAsync } from "@acme/kit";

type Params = { url: string; body: string; signature: string };

export type ForwardResult =
	| { type: "delivered"; status: number }
	| { type: "failed"; status: number | null };

const FORWARD_TIMEOUT_MS = 10_000;

export async function forwardEvent(params: Params): Promise<ForwardResult> {
	const { url, body, signature } = params;
	const response = await attemptAsync(() =>
		fetch(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"trbt-signature": signature,
			},
			// Та же строка, что прошла проверку: подпись сойдётся у проекта.
			body,
			signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
		}),
	);
	if (!response.ok) return { type: "failed", status: null };
	const { status, ok } = response.value;
	return ok ? { type: "delivered", status } : { type: "failed", status };
}
