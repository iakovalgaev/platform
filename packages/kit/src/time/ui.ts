import { dayjs } from "./dayjs";

export const UIKIT_DATE_FORMAT = "YYYY-MM-DD";
export const UI_DATE_FORMAT = "D MMM, YYYY";

export const toUserIsoDate = (d: Date, timezone: string): string =>
	dayjs(d).tz(timezone).format(UIKIT_DATE_FORMAT);

export const toUiDate = (d: Date, locale: string): string => {
	const isCurrentYear = dayjs(d).isSame(dayjs(), "year");
	const format = isCurrentYear ? UI_DATE_FORMAT.split(",")[0] : UI_DATE_FORMAT;
	return dayjs(d).locale(locale).format(format);
};

export const toLongDate = (d: Date, timezone: string): string => {
	const local = dayjs(d).tz(timezone);
	const isCurrentYear = local.isSame(dayjs().tz(timezone), "year");
	return local.locale("ru").format(isCurrentYear ? "D MMMM" : "D MMMM YYYY");
};
