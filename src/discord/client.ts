import {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Creates and configures the Discord client.
 *
 * We need:
 * - Guilds: to know which server a message is from
 * - GuildMessages + MessageContent: to track messages
 * - GuildMessageReactions: to track reactions
 *
 * Partials are required to receive reaction events on
 * messages that weren't cached at startup.
 */
export function createClient(): Client {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.Channel],
  });
}

/**
 * Registers slash commands with Discord's API.
 * This is idempotent — safe to call on every startup.
 * Changes take effect immediately for guild commands.
 */
export async function registerSlashCommands(guildIds: string[]) {
  const commands = [
    new SlashCommandBuilder()
      .setName("wrapped")
      .setDescription("Show your server's wrapped summary")
      .addSubcommand((sub) =>
        sub.setName("weekly").setDescription("Show this week's summary")
      )
      .addSubcommand((sub) =>
        sub.setName("monthly").setDescription("Show this month's summary")
      )
      .toJSON(),
  ];

  const rest = new REST().setToken(env.DISCORD_TOKEN);

  for (const guildId of guildIds) {
    const clientId = Buffer.from(
      env.DISCORD_TOKEN.split(".")[0],
      "base64"
    ).toString();

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    logger.info("Slash commands registered", { guildId });
  }
}
