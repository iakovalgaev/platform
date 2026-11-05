import { createHmac } from "node:crypto";
import fastify from "fastify";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Route } from "~/tribute";
import { webhookPlugin } from "./webhook";

const API_KEY = "secret";
const ROUTES: Route[] = [
	{ name: "dubmate", url: "https://dubmate.test/hook", productIds: ["10"] },
	{ name: "polka", url: "https://polka.test/hook", productIds: ["20"] },
];

let app: ReturnType<typeof fastify>;
let fetchSpy: ReturnType<typeof mockFetch>;

beforeEach(async () => {
	app = fastify();
	await app.register(webhookPlugin, { apiKey: API_KEY, routes: ROUTES });
	fetchSpy = mockFetch(200);
});

afterEach(async () => {
	vi.restoreAllMocks();
	await app.close();
});

describe("POST /tribute", () => {
	test("пересылает событие проекту-владельцу с тем же телом и подписью", async () => {
		const body = eventBody({ product_id: 20 });
		const signature = sign(body);

		const response = await post(body, signature);

		expect(response.statusCode).toBe(200);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		const [url, init] = fetchSpy.mock.calls[0] ?? [];
		expect(url).toBe("https://polka.test/hook");
		expect(init?.body).toBe(body);
		expect(new Headers(init?.headers).get("trbt-signature")).toBe(signature);
	});

	test("товар числом и строкой идёт одному проекту", async () => {
		await post(eventBody({ product_id: 10 }));
		await post(eventBody({ product_id: "10" }));

		const urls = fetchSpy.mock.calls.map(([url]) => url);
		expect(urls).toEqual([
			"https://dubmate.test/hook",
			"https://dubmate.test/hook",
		]);
	});

	test("отвечает 403 на неверную подпись и ничего не пересылает", async () => {
		const response = await post(eventBody({ product_id: 20 }), "bad");

		expect(response.statusCode).toBe(403);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	test("не пересылает неизвестный товар и отвечает 200", async () => {
		const response = await post(eventBody({ product_id: 99 }));

		expect(response.statusCode).toBe(200);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	test("не пересылает событие без товара", async () => {
		const response = await post(eventBody({}));

		expect(response.statusCode).toBe(200);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	test("не пересылает неразбираемый JSON с верной подписью", async () => {
		const response = await post("not json");

		expect(response.statusCode).toBe(200);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	test("отвечает 502, когда проект ответил ошибкой", async () => {
		fetchSpy = mockFetch(500);

		const response = await post(eventBody({ product_id: 10 }));

		expect(response.statusCode).toBe(502);
	});

	test("отвечает 502, когда запрос к проекту упал", async () => {
		fetchSpy.mockRejectedValue(new Error("network"));

		const response = await post(eventBody({ product_id: 10 }));

		expect(response.statusCode).toBe(502);
	});
});

function post(body: string, signature = sign(body)) {
	return app.inject({
		method: "POST",
		url: "/tribute",
		headers: {
			"content-type": "application/json",
			"trbt-signature": signature,
		},
		payload: body,
	});
}

function eventBody(payload: Record<string, unknown>): string {
	return JSON.stringify({
		name: "new_digital_product",
		payload: { purchase_id: 7, ...payload },
	});
}

function sign(body: string): string {
	return createHmac("sha256", API_KEY).update(body).digest("hex");
}

function mockFetch(status: number) {
	return vi
		.spyOn(globalThis, "fetch")
		.mockImplementation(async () => new Response("", { status }));
}
