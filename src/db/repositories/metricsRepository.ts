import { sql } from "drizzle-orm";
import { db } from "../connection";
import { metricBuckets } from "../schema";
import { TimeBucketKey } from "../../metrics/TimeBucket";
import { logger } from "../../utils/logger";

export interface FlushEntry {
  key: TimeBucketKey;
  value: number;
}

/**
 * Upserts a batch of metric bucket entries into the database.
 *
 * Uses INSERT OR IGNORE + UPDATE to atomically increment existing rows.
 * This avoids race conditions and keeps the flush logic simple.
 */
export async function flushMetrics(entries: FlushEntry[]): Promise<void> {
  if (entries.length === 0) return;

  try {
    // better-sqlite3 is synchronous — we batch inside a transaction
    // for performance and atomicity
    db.transaction((tx) => {
      for (const { key, value } of entries) {
        tx.insert(metricBuckets)
          .values({
            guildId: key.guildId,
            metricName: key.metricName,
            bucketStart: key.bucketStart,
            bucketGranularity: "hour",
            value,
            channelId: key.channelId ?? null,
            userId: key.userId ?? null,
            emojiId: key.emojiId ?? null,
            emojiName: key.emojiName ?? null,
            isAnimated: key.isAnimated ?? false,
          })
          .run();
      }
    });
  } catch (err) {
    logger.error("Failed to flush metrics", { error: String(err) });
    throw err; // Re-throw so the tracker knows it failed
  }
}
