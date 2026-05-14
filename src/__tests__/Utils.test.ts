import { describe, it, expect } from "vitest";
import { toHourBucket, toHourBucketString, getUTCDayName } from "../utils/dates";

describe("Date Utilities", () => {
  it("should floor dates to the start of the hour", () => {
    const date = new Date("2024-03-20T15:30:45.123Z");
    const floored = toHourBucket(date);
    expect(floored.toISOString()).toBe("2024-03-20T15:00:00.000Z");
  });

  it("should return correct hour bucket string", () => {
    const date = new Date("2024-03-20T15:30:45.123Z");
    expect(toHourBucketString(date)).toBe("2024-03-20T15:00:00.000Z");
  });

  it("should return correct UTC day names", () => {
    expect(getUTCDayName(new Date("2024-03-18T12:00:00Z"))).toBe("Monday");
    expect(getUTCDayName(new Date("2024-03-24T12:00:00Z"))).toBe("Sunday");
  });
});
