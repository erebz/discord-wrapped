import { and, eq, gte, lt, sql, desc } from "drizzle-orm";
import { db } from "../db/connection";
import { metricBuckets } from "../db/schema";
import { MetricName } from "../metrics/MetricName";
import { getUTCDayName } from "../utils/dates";

export interface WrappedData {
  totalMessages: number;
  activeMembers: number;
  topChannel: string | null;
  busiestDay: string | null;
  peakHour: number | null;
  totalReactions: number;
  topEmoji: { name: string; id: string | null; isAnimated: boolean } | null;
  mostReactiveMember: string | null;
  topUsers: { userId: string; count: number }[];
}

/**
 * Queries all wrapped data for a guild within a date range.
 */
export async function queryWrappedData(
  guildId: string,
  start: Date,
  end: Date
): Promise<WrappedData> {
  const startStr = start.toISOString();
  const endStr = end.toISOString();

  const guildStart = and(
    eq(metricBuckets.guildId, guildId),
    gte(metricBuckets.bucketStart, startStr),
    lt(metricBuckets.bucketStart, endStr)
  );

  // --- Messages ---

  const [{ totalMessages }] = await db
    .select({
      totalMessages: sql<number>`COALESCE(SUM(${metricBuckets.value}), 0)`,
    })
    .from(metricBuckets)
    .where(and(guildStart, eq(metricBuckets.metricName, MetricName.MESSAGES_SENT)));

  // Distinct users who sent at least one message
  const [{ activeMembers }] = await db
    .select({
      activeMembers: sql<number>`COUNT(DISTINCT ${metricBuckets.userId})`,
    })
    .from(metricBuckets)
    .where(
      and(
        guildStart,
        eq(metricBuckets.metricName, MetricName.MESSAGES_SENT)
      )
    );

  // Top 3 most active users (by messages sent)
  const topUsers = await db
    .select({
      userId: metricBuckets.userId,
      count: sql<number>`SUM(${metricBuckets.value})`,
    })
    .from(metricBuckets)
    .where(
      and(
        guildStart,
        eq(metricBuckets.metricName, MetricName.MESSAGES_SENT),
        sql`${metricBuckets.userId} IS NOT NULL`
      )
    )
    .groupBy(metricBuckets.userId)
    .orderBy(desc(sql`SUM(${metricBuckets.value})`))
    .limit(3);

  // Channel with the most messages
  const topChannelRow = await db
    .select({
      channelId: metricBuckets.channelId,
      total: sql<number>`SUM(${metricBuckets.value})`,
    })
    .from(metricBuckets)
    .where(and(guildStart, eq(metricBuckets.metricName, MetricName.MESSAGES_SENT)))
    .groupBy(metricBuckets.channelId)
    .orderBy(desc(sql`SUM(${metricBuckets.value})`))
    .limit(1);

  const topChannel = topChannelRow[0]?.channelId ?? null;

  // Busiest day — aggregate by calendar day derived from bucket_start
  const busiestDayRow = await db
    .select({
      day: sql<string>`STRFTIME('%Y-%m-%d', ${metricBuckets.bucketStart})`,
      total: sql<number>`SUM(${metricBuckets.value})`,
    })
    .from(metricBuckets)
    .where(and(guildStart, eq(metricBuckets.metricName, MetricName.MESSAGES_SENT)))
    .groupBy(sql`STRFTIME('%Y-%m-%d', ${metricBuckets.bucketStart})`)
    .orderBy(desc(sql`SUM(${metricBuckets.value})`))
    .limit(1);

  const busiestDay = busiestDayRow[0]?.day
    ? getUTCDayName(new Date(busiestDayRow[0].day))
    : null;

  // Peak hour — aggregate by hour of day (0–23)
  const peakHourRow = await db
    .select({
      hour: sql<number>`CAST(STRFTIME('%H', ${metricBuckets.bucketStart}) AS INTEGER)`,
      total: sql<number>`SUM(${metricBuckets.value})`,
    })
    .from(metricBuckets)
    .where(and(guildStart, eq(metricBuckets.metricName, MetricName.MESSAGES_SENT)))
    .groupBy(sql`STRFTIME('%H', ${metricBuckets.bucketStart})`)
    .orderBy(desc(sql`SUM(${metricBuckets.value})`))
    .limit(1);

  const peakHour = peakHourRow[0]?.hour ?? null;

  // --- Reactions ---

  const [{ totalReactions }] = await db
    .select({
      totalReactions: sql<number>`COALESCE(SUM(${metricBuckets.value}), 0)`,
    })
    .from(metricBuckets)
    .where(
      and(guildStart, eq(metricBuckets.metricName, MetricName.REACTIONS_ADDED))
    );

  // Top emoji by total uses
  const topEmojiRow = await db
    .select({
      emojiName: metricBuckets.emojiName,
      emojiId: metricBuckets.emojiId,
      isAnimated: metricBuckets.isAnimated,
      total: sql<number>`SUM(${metricBuckets.value})`,
    })
    .from(metricBuckets)
    .where(and(guildStart, eq(metricBuckets.metricName, MetricName.EMOJIS_USED)))
    .groupBy(metricBuckets.emojiName, metricBuckets.emojiId, metricBuckets.isAnimated)
    .orderBy(desc(sql`SUM(${metricBuckets.value})`))
    .limit(1);

  const topEmoji = topEmojiRow[0]
    ? {
        name: topEmojiRow[0].emojiName as string,
        id: topEmojiRow[0].emojiId as string | null,
        isAnimated: Boolean(topEmojiRow[0].isAnimated),
      }
    : null;

  // Most reactive member — highest reaction count
  const mostReactiveMemberRow = await db
    .select({
      userId: metricBuckets.userId,
      total: sql<number>`SUM(${metricBuckets.value})`,
    })
    .from(metricBuckets)
    .where(
      and(guildStart, eq(metricBuckets.metricName, MetricName.REACTIONS_ADDED))
    )
    .groupBy(metricBuckets.userId)
    .orderBy(desc(sql`SUM(${metricBuckets.value})`))
    .limit(1);

  const mostReactiveMember = mostReactiveMemberRow[0]?.userId ?? null;

  return {
    totalMessages: Number(totalMessages),
    activeMembers: Number(activeMembers),
    topChannel,
    busiestDay,
    peakHour,
    totalReactions: Number(totalReactions),
    topEmoji,
    mostReactiveMember,
    topUsers: topUsers.map((u) => ({
      userId: u.userId as string,
      count: Number(u.count),
    })),
  };
}
