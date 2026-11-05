import { z } from "zod";

export const DateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Use ISO date YYYY-MM-DD");

export type DateString = z.infer<typeof DateString>;

export const TimeString = z
	.string()
	.regex(/^\d{2}:\d{2}$/, "Use time format HH:MM");

export type TimeString = z.infer<typeof TimeString>;
