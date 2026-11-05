import { createHmac, timingSafeEqual } from "node:crypto";

// Формат дайджеста в документации Tribute не описан, принимаем hex и base64.
export function isValidSignature(
	body: string,
	signature: string,
	apiKey: string,
): boolean {
	const digest = createHmac("sha256", apiKey).update(body).digest();
	return (
		isEqual(signature, digest.toString("hex")) ||
		isEqual(signature, digest.toString("base64"))
	);
}

function isEqual(left: string, right: string): boolean {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);
	if (leftBuffer.length !== rightBuffer.length) return false;
	return timingSafeEqual(leftBuffer, rightBuffer);
}
