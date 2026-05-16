/**
 * Floors a Date to the start of its UTC hour.
 * This is the granularity we store metrics at.
 */
export function toHourBucket(date: Date): Date {
  const d = new Date(date);
  d.setUTCMinutes(0, 0, 0);
  return d;
}

/**
 * Returns the ISO string of the hour bucket for a given date.
 * Used as the bucket_start value in the database.
 */
export function toHourBucketString(date: Date): string {
  return toHourBucket(date).toISOString();
}

/**
 * Returns the start and end of the current UTC week (Monday–Sunday).
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = (day === 0 ? -6 : 1 - day);

  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() + diffToMonday);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  return { start, end };
}

/**
 * Returns the start and end of the current UTC month.
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();

  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return { start, end };
}

/**
 * Returns the UTC day name for a given date.
 */
export function getUTCDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}

/**
 * Formats a date range as a string (e.g. "May 10 - May 17, 2026").
 */
export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  const startStr = start.toLocaleDateString("en-US", options);
  const endStr = end.toLocaleDateString("en-US", {
    ...options,
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
}
