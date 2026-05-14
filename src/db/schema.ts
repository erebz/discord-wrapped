import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Central metrics table.
 *
 * Each row represents the aggregated value of one metric,
 * for one combination of dimensions (guild, channel, user, emoji),
 * within one time bucket.
 *
 * Sparse dimensions (channel_id, user_id, emoji_name) are nullable
 * so the same table handles both coarse and fine-grained metrics.
 */
export const metricBuckets = sqliteTable("metric_buckets", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Which server this metric belongs to
  guildId: text("guild_id").notNull(),

  // The metric being tracked (e.g. "messages.sent", "reactions.added")
  metricName: text("metric_name").notNull(),

  // ISO timestamp floored to the hour
  bucketStart: text("bucket_start").notNull(),

  // Granularity label — always "hour" for now, kept for future flexibility
  bucketGranularity: text("bucket_granularity").notNull().default("hour"),

  // The aggregated count for this bucket
  value: integer("value").notNull().default(0),

  // Optional dimensions — null means "not broken down by this dimension"
  channelId: text("channel_id"),
  userId: text("user_id"),
  emojiId: text("emoji_id"),
  emojiName: text("emoji_name"),
  isAnimated: integer("is_animated", { mode: "boolean" }).notNull().default(false),
});

export type MetricBucket = typeof metricBuckets.$inferSelect;
export type NewMetricBucket = typeof metricBuckets.$inferInsert;
