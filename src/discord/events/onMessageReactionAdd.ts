import { Events, MessageReaction, User } from "discord.js";
import { metricsTracker } from "../../metrics/MetricsTracker";
import { MetricName } from "../../metrics/MetricName";
import { makeBucketKey } from "../../metrics/TimeBucket";
import { logger } from "../../utils/logger";

export const event = {
  name: Events.MessageReactionAdd,
  async handler(reaction: MessageReaction, user: User) {
    // Fetch partial reactions/messages if needed
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (err) {
        logger.error("Failed to fetch partial reaction", { error: String(err) });
        return;
      }
    }

    if (!reaction.message.inGuild()) return;
    if (user.bot) return;

    const now = new Date();
    const guildId = reaction.message.guildId!;
    const channelId = reaction.message.channelId;
    const userId = user.id;
    const emojiId = reaction.emoji.id ?? undefined;
    const emojiName = reaction.emoji.name ?? undefined;
    const isAnimated = reaction.emoji.animated ?? undefined;

    const baseKey = {
      guildId,
      channelId,
      userId,
      emojiId,
      emojiName,
      isAnimated,
      date: now,
    };

    // reactions.added — one entry per reaction event
    metricsTracker.increment(
      makeBucketKey({ ...baseKey, metricName: MetricName.REACTIONS_ADDED })
    );

    // emojis.used — tracks which emoji was used
    metricsTracker.increment(
      makeBucketKey({ ...baseKey, metricName: MetricName.EMOJIS_USED })
    );

    logger.debug("Reaction tracked", { guildId, emojiName, userId });
  },
} as const;
