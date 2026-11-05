// Эти дубликаты "import "dayjs/..." нужны, чтобы они
// попали в .d.ts и TS «увидел» dayjs.utc(), dayjs.tz(), …
// в приложениях, использующих "@acme/kit/time"
import "dayjs/plugin/utc";
import "dayjs/plugin/timezone";
import "dayjs/plugin/customParseFormat";
import "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";

import dayjs from "dayjs";
import customParse from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParse);
dayjs.extend(isoWeek);

export { dayjs };
