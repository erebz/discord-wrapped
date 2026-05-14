import { MetricName } from "./MetricName";
import { toHourBucketString } from "../utils/dates";

export interface TimeBucketKey {
  guildId: string;
  metricName: MetricName;
  bucketStart: string;
  channelId?: string;
  userId?: string;
  emojiId?: string;
  emojiName?: string;
  isAnimated?: boolean;
}

/**
 * Serialises a TimeBucketKey to a string so it can be used as a Map key.
 * Undefined dimensions are represented as the empty string.
 */
export function serializeKey(key: TimeBucketKey): string {
  return [
    key.guildId,
    key.metricName,
    key.bucketStart,
    key.channelId ?? "",
    key.userId ?? "",
    key.emojiId ?? "",
    key.emojiName ?? "",
    key.isAnimated ? "1" : "0",
  ].join("|");
}

/**
 * Builds a TimeBucketKey from a Discord event's context.
 */
export function makeBucketKey(
  params: Omit<TimeBucketKey, "bucketStart"> & { date: Date }
): TimeBucketKey {
  const { date, ...rest } = params;
  return {
    ...rest,
    bucketStart: toHourBucketString(date),
  };
}
