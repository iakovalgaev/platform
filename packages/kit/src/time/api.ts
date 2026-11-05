import { DEFAULT_USER_TIMEZONE } from "./constants";
import { dayjs } from "./dayjs";
import { toUserIsoDate } from "./ui";

export const API_DATE_FORMAT = "YYYY-MM-DD";

export function addDays(date: string, days: number) {
	return dayjs(date).add(days, "day").format(API_DATE_FORMAT);
}

export function diffDays(from: string, to: string) {
	return dayjs(to).diff(dayjs(from), "day");
}

export const isValidDate = (value: string): boolean =>
	dayjs(value, API_DATE_FORMAT, true).isValid();

export const isValidLocalTime = (value: string): boolean =>
	/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d{1,3})?)?$/.test(value);

export const isValidTimeZone = (tz: string) => {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: tz });
		return true;
	} catch {
		return false;
	}
};

export const toIsoDate = (d: Date): string =>
	dayjs(d).utc().format(API_DATE_FORMAT);

/**
 * Склейка date + time + tz → Date UTC
 *
 * @param dateStr 'YYYY-MM-DD'
 * @param timeStr 'HH:MM[:SS]'
 * @param tz      IANA-строка, например 'Europe/Moscow'
 */
export function combineDateAndTime(
	dateStr: string,
	timeStr: string,
	tz: string,
): Date {
	const dt = dayjs.tz(`${dateStr}T${timeStr}`, "YYYY-MM-DDTHH:mm:ss", tz);
	if (!dt.isValid()) {
		throw new Error("Invalid date or time string");
	}
	return dt.utc().toDate();
}

export function startOfUserDay(now: Date, timezone?: string | null): Date {
	const tz = timezone ?? DEFAULT_USER_TIMEZONE;
	return dayjs(now).tz(tz).startOf("day").utc().toDate();
}

export function nextDailyOccurrence(params: {
	now: Date;
	timezone?: string | null;
	time: string;
}): Date {
	const timezone = params.timezone ?? DEFAULT_USER_TIMEZONE;
	const nowTz = dayjs(params.now).tz(timezone);
	const isoDate = toUserIsoDate(params.now, timezone);

	const localCandidate = dayjs.tz(
		`${isoDate}T${normalizeLocalTime(params.time)}`,
		"YYYY-MM-DDTHH:mm:ss",
		timezone,
	);

	const nextLocal = localCandidate.isAfter(nowTz)
		? localCandidate
		: localCandidate.add(1, "day");

	return nextLocal.utc().toDate();
}

function normalizeLocalTime(v: string): string {
	return v.length === 5 ? `${v}:00` : v;
}
