import { API_DATE_FORMAT } from "./api";
import { dayjs } from "./dayjs";
import type { DateString } from "./schemas";

export function prevDate(date: DateString): DateString {
	return dayjs(date).subtract(1, "day").format(API_DATE_FORMAT);
}

export function isoWeekDates(date: DateString): DateString[] {
	const monday = dayjs(date).startOf("isoWeek");
	return Array.from({ length: 7 }, (_, i) =>
		monday.add(i, "day").format(API_DATE_FORMAT),
	);
}
