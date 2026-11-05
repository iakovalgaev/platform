import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import {
	findRoute,
	forwardEvent,
	isValidSignature,
	type Route,
	readEvent,
} from "~/tribute";

type Options = { apiKey: string; routes: Route[] };

const OK = { status: "ok" };

export const webhookPlugin: FastifyPluginAsync<Options> = async (app, opts) => {
	const { apiKey, routes } = opts;
	app.addContentTypeParser(
		"application/json",
		{ parseAs: "string" },
		(_req, body, done) => done(null, body),
	);

	app.post("/tribute", async (req, reply) => {
		const body = req.body;
		if (typeof body !== "string") return reply.code(400).send();
		const signature = readSignature(req);
		if (signature === null || !isValidSignature(body, signature, apiKey)) {
			req.log.warn({}, "tribute-rejected");
			return reply.code(403).send();
		}
		return route({ req, reply, body, signature, routes });
	});
};

type RouteParams = {
	req: FastifyRequest;
	reply: FastifyReply;
	body: string;
	signature: string;
	routes: Route[];
};

async function route(params: RouteParams) {
	const { req, reply, body, signature, routes } = params;
	const event = readEvent(body);
	if (event === null || event.productId === null) {
		req.log.info({ event: event?.name }, "tribute-unroutable");
		return reply.code(200).send(OK);
	}
	const { name, productId, purchaseId } = event;
	const target = findRoute(routes, productId);
	if (target === null) {
		req.log.error(
			{ alert: true, event: name, productId, purchaseId },
			"tribute-unknown-product",
		);
		return reply.code(200).send(OK);
	}
	const result = await forwardEvent({ url: target.url, body, signature });
	if (result.type === "failed") {
		req.log.warn(
			{ route: target.name, event: name, status: result.status },
			"tribute-forward-failed",
		);
		return reply.code(502).send();
	}
	req.log.info(
		{ route: target.name, event: name, productId, purchaseId },
		"tribute-forwarded",
	);
	return reply.code(200).send(OK);
}

function readSignature(req: FastifyRequest): string | null {
	const signature = req.headers["trbt-signature"];
	return typeof signature === "string" ? signature : null;
}
