import { Events, Message } from "discord.js";
import { metricsTracker } from "../../metrics/MetricsTracker";
import { MetricName } from "../../metrics/MetricName";
import { makeBucketKey } from "../../metrics/TimeBucket";
import { logger } from "../../utils/logger";

export const event = {
  name: Events.MessageCreate,
  handler(message: Message) {
    // Ignore DMs, bots, and system messages
    if (!message.inGuild()) return;
    if (message.author.bot) return;

    const now = new Date();

    // Track total messages per guild+channel+user
    metricsTracker.increment(
      makeBucketKey({
        guildId: message.guildId,
        metricName: MetricName.MESSAGES_SENT,
        channelId: message.channelId,
        userId: message.author.id,
        date: now,
      })
    );

    logger.debug("Message tracked", {
      guild: message.guildId,
      channel: message.channelId,
      user: message.author.id,
    });
  },
} as const;
