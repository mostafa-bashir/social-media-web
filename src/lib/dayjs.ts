import dayjs, { type Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export { dayjs, type Dayjs };

const WALL_CLOCK_FORMAT = "YYYY-MM-DDTHH:mm:ss";

/** A UTC instant from the API, in `zone`'s wall-clock time. */
export function toZoned(utcIso: string, zone: string): Dayjs {
  return dayjs.utc(utcIso).tz(zone);
}

/**
 * antd pickers hold browser-local dayjs values. Scheduling is in the client's
 * zone, so the picker's wall-clock fields are read as `zone` time and sent as
 * an ISO instant with that zone's offset (the API stores UTC).
 */
export function pickerValueToIso(value: Dayjs, zone: string): string {
  return dayjs.tz(value.format(WALL_CLOCK_FORMAT), zone).format();
}

/** The reverse of `pickerValueToIso`: shows a UTC instant as `zone` wall-clock in a picker. */
export function isoToPickerValue(utcIso: string, zone: string): Dayjs {
  return dayjs(toZoned(utcIso, zone).format(WALL_CLOCK_FORMAT));
}

/** "Now" in `zone`, as a picker value — for disabling past dates and times. */
export function nowAsPickerValue(zone: string): Dayjs {
  return dayjs(dayjs().tz(zone).format(WALL_CLOCK_FORMAT));
}

/** The viewer's own zone, for views that span clients in different zones. */
export function browserTimezone(): string {
  return dayjs.tz.guess();
}
