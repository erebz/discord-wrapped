import { describe, it, expect } from "vitest";
import { makeBucketKey, serializeKey } from "../metrics/TimeBucket";
import { MetricName } from "../metrics/MetricName";

describe("TimeBucket", () => {
  const mockDate = new Date("2024-03-20T15:30:45.000Z");

  it("should generate a correct bucket key with hour granularity", () => {
    const key = makeBucketKey({
      guildId: "guild123",
      metricName: MetricName.MESSAGES_SENT,
      channelId: "chan456",
      userId: "user789",
      date: mockDate,
    });

    expect(key.bucketStart).toBe("2024-03-20T15:00:00.000Z");
    expect(key.guildId).toBe("guild123");
    expect(key.metricName).toBe(MetricName.MESSAGES_SENT);
  });

  it("should serialize keys consistently", () => {
    const key: any = {
      guildId: "g1",
      metricName: MetricName.MESSAGES_SENT,
      bucketStart: "2024-03-20T15:00:00.000Z",
      channelId: "c1",
      userId: "u1",
      isAnimated: true,
    };

    const serial1 = serializeKey(key);
    const serial2 = serializeKey({ ...key });

    expect(serial1).toBe(serial2);
    expect(serial1).toContain("g1");
    expect(serial1).toContain("messages.sent");
    expect(serial1).toContain("1"); // isAnimated
  });

  it("should handle optional dimensions in serialization", () => {
    const key: any = {
      guildId: "g1",
      metricName: MetricName.MESSAGES_SENT,
      bucketStart: "2024-03-20T15:00:00.000Z",
    };

    const serial = serializeKey(key);
    const parts = serial.split("|");
    // guildId, metricName, bucketStart, channelId, userId, emojiId, emojiName, isAnimated
    expect(parts.length).toBe(8);
    expect(parts[3]).toBe(""); // channelId
    expect(parts[7]).toBe("0"); // isAnimated default
  });
});
