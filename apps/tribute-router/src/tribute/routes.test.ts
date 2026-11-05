import { describe, expect, test } from "vitest";
import { findRoute, zRoutes } from "./routes";

const dubmate = {
	name: "dubmate",
	url: "https://a.test/hook",
	productIds: ["1", "2"],
};
const polka = { name: "polka", url: "https://b.test/hook", productIds: ["3"] };

describe("zRoutes", () => {
	test("принимает маршруты с разными товарами", () => {
		expect(zRoutes.safeParse([dubmate, polka]).success).toBe(true);
	});

	test("отклоняет один товар у двух проектов", () => {
		const clash = { ...polka, productIds: ["2"] };
		expect(zRoutes.safeParse([dubmate, clash]).success).toBe(false);
	});

	test("отклоняет одинаковые имена проектов", () => {
		const clash = { ...polka, name: "dubmate" };
		expect(zRoutes.safeParse([dubmate, clash]).success).toBe(false);
	});
});

describe("findRoute", () => {
	test("находит владельца товара", () => {
		expect(findRoute([dubmate, polka], "3")?.name).toBe("polka");
	});

	test("возвращает null для чужого товара", () => {
		expect(findRoute([dubmate, polka], "99")).toBeNull();
	});
});
