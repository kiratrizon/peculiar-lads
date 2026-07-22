import { Carbon } from "helpers";

// Asia/Manila is UTC+8 year-round (no DST). Carbon's default timezone is set
// to config("app.timezone") (Asia/Manila) at boot (see main.ts / Boot.ts), so
// the compute functions below build on Carbon.parse()/arithmetic directly
// rather than hand-rolling the offset - Carbon already handles it correctly.
// formatManilaDisplay below still does its own flat-offset math since it
// works off a raw UTC Date/string, not a Carbon instance.
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

export type TimeOfDay = { hour: number; minute: number; second: number };

export const parseTimeOfDay = (time: string): TimeOfDay => {
  const [hour, minute, second] = time.split(":").map((part) => Number(part));
  return { hour, minute: minute ?? 0, second: second ?? 0 };
};

const formatTimeOfDay = (time: TimeOfDay): string =>
  [time.hour, time.minute, time.second]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// DATETIME columns are stored/read via the app's global `date()`/`strToTime()`
// helpers (both Carbon/Luxon-backed, both honoring config("app.timezone")),
// rather than hand-rolled timezone math - they already do this correctly.
// Despite the "timestamp" naming, date()/Carbon.createFromTimestamp actually
// take milliseconds (Luxon's DateTime.fromMillis under the hood), not
// PHP-style seconds - so this passes getTime() straight through.
export const toAppStoredDatetime = (utcDate: Date): string =>
  date("Y-m-d H:i:s", utcDate.getTime());

export const parseAppStoredDatetime = (dbString: string): Date =>
  new Date(strToTime(dbString) ?? 0);

/** Formats a UTC instant as its Asia/Manila wall-clock time, e.g. "Jul 20, 2026 9:00 AM". */
export const formatManilaDisplay = (utcInstant: string | Date): string => {
  const manila = new Date(
    new Date(utcInstant).getTime() + MANILA_OFFSET_MS,
  );
  const hour24 = manila.getUTCHours();
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minute = String(manila.getUTCMinutes()).padStart(2, "0");
  const suffix = hour24 < 12 ? "AM" : "PM";

  return `${WEEKDAY_NAMES[manila.getUTCDay()]}, ${
    MONTH_NAMES[manila.getUTCMonth()]
  } ${manila.getUTCDate()}, ${manila.getUTCFullYear()} ${hour12}:${minute} ${suffix}`;
};

export const computeSingleRun = (
  scheduledDate: string,
  time: TimeOfDay,
): Carbon => Carbon.parse(`${scheduledDate} ${formatTimeOfDay(time)}`);

/** Next occurrence of `dayOfWeek` (0=Sun..6=Sat, Manila-local) at `time`, strictly after `now`. */
export const computeNextWeeklyRun = (
  now: Carbon,
  dayOfWeek: number,
  time: TimeOfDay,
): Carbon => {
  const todayAtTime = Carbon.parse(`${now.toDateString()} ${formatTimeOfDay(time)}`);
  // Carbon/Luxon's weekday is ISO (1=Mon..7=Sun); this app's dayOfWeek is
  // 0=Sun..6=Sat (matching JS Date.getDay()), hence the 0->7 remap.
  const isoTargetWeekday = dayOfWeek === 0 ? 7 : dayOfWeek;
  const deltaDays = (isoTargetWeekday - todayAtTime.weekday() + 7) % 7;

  let candidate = todayAtTime.addDays(deltaDays);
  if (candidate.to("seconds") <= now.to("seconds")) {
    candidate = candidate.addWeeks(1);
  }
  return candidate;
};

/** Next occurrence of `dayOfMonth` (clamped to the last day of short months) at `time`, strictly after `now`. */
export const computeNextMonthlyRun = (
  now: Carbon,
  dayOfMonth: number,
  time: TimeOfDay,
): Carbon => {
  const clampedDay = (base: Carbon) => Math.min(dayOfMonth, base.daysInMonth());

  let candidate = Carbon.create(
    now.year(),
    now.month(),
    clampedDay(now),
    time.hour,
    time.minute,
    time.second,
  );

  if (candidate.to("seconds") <= now.to("seconds")) {
    const nextMonthBase = now.addMonths(1);
    candidate = Carbon.create(
      nextMonthBase.year(),
      nextMonthBase.month(),
      clampedDay(nextMonthBase),
      time.hour,
      time.minute,
      time.second,
    );
  }

  return candidate;
};
