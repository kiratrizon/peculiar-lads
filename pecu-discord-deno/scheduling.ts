// Asia/Manila is UTC+8 year-round (no DST), so "Manila wall-clock time" can
// be computed with a flat 8-hour offset instead of needing a timezone
// database. All functions here take/return UTC `Date` instants; callers
// persist `next_run_at` as UTC.
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

export type TimeOfDay = { hour: number; minute: number; second: number };

export const parseTimeOfDay = (time: string): TimeOfDay => {
  const [hour, minute, second] = time.split(":").map((part) => Number(part));
  return { hour, minute: minute ?? 0, second: second ?? 0 };
};

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

const manilaWallClockToUtc = (
  year: number,
  month0: number,
  day: number,
  time: TimeOfDay,
): Date =>
  new Date(
    Date.UTC(year, month0, day, time.hour, time.minute, time.second) -
      MANILA_OFFSET_MS,
  );

const toManilaWallClock = (utcInstant: Date): Date =>
  new Date(utcInstant.getTime() + MANILA_OFFSET_MS);

const lastDayOfMonth = (year: number, month0: number): number =>
  new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();

export const computeSingleRun = (
  scheduledDate: string,
  time: TimeOfDay,
): Date => {
  const [year, month, day] = scheduledDate.split("-").map(Number);
  return manilaWallClockToUtc(year, month - 1, day, time);
};

/** Next occurrence of `dayOfWeek` (0=Sun..6=Sat, Manila-local) at `time`, strictly after `fromUtc`. */
export const computeNextWeeklyRun = (
  fromUtc: Date,
  dayOfWeek: number,
  time: TimeOfDay,
): Date => {
  const manilaNow = toManilaWallClock(fromUtc);
  const year = manilaNow.getUTCFullYear();
  const month0 = manilaNow.getUTCMonth();
  const deltaDays = (dayOfWeek - manilaNow.getUTCDay() + 7) % 7;

  let candidate = manilaWallClockToUtc(
    year,
    month0,
    manilaNow.getUTCDate() + deltaDays,
    time,
  );
  if (candidate.getTime() <= fromUtc.getTime()) {
    candidate = manilaWallClockToUtc(
      year,
      month0,
      manilaNow.getUTCDate() + deltaDays + 7,
      time,
    );
  }
  return candidate;
};

/** Next occurrence of `dayOfMonth` (clamped to the last day of short months) at `time`, strictly after `fromUtc`. */
export const computeNextMonthlyRun = (
  fromUtc: Date,
  dayOfMonth: number,
  time: TimeOfDay,
): Date => {
  const manilaNow = toManilaWallClock(fromUtc);
  let year = manilaNow.getUTCFullYear();
  let month0 = manilaNow.getUTCMonth();

  let candidate = manilaWallClockToUtc(
    year,
    month0,
    Math.min(dayOfMonth, lastDayOfMonth(year, month0)),
    time,
  );

  if (candidate.getTime() <= fromUtc.getTime()) {
    month0 += 1;
    if (month0 > 11) {
      month0 = 0;
      year += 1;
    }
    candidate = manilaWallClockToUtc(
      year,
      month0,
      Math.min(dayOfMonth, lastDayOfMonth(year, month0)),
      time,
    );
  }

  return candidate;
};
