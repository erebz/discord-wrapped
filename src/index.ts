import { Events, Interaction } from "discord.js";
import { createClient, registerSlashCommands } from "./discord/client";
import { registerEvents } from "./discord/registerEvents";
import { runMigrations } from "./db/connection";
import { metricsTracker } from "./metrics/MetricsTracker";
import { buildWeeklyWrapped } from "./wrapped/buildWeeklyWrapped";
import { buildMonthlyWrapped } from "./wrapped/buildMonthlyWrapped";
import { renderWrappedEmbed } from "./wrapped/renderWrappedEmbed";
import { env } from "./config/env";
import { logger } from "./utils/logger";

async function main() {
  // 1. Database
  runMigrations();

  // 2. Metrics buffer
  metricsTracker.start();

  // 3. Discord client
  const client = createClient();
  registerEvents(client);

  // 4. Slash command handler
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "wrapped") return;
    if (!interaction.guildId) {
      await interaction.reply({
        content: "Wrapped is only available in servers.",
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    await interaction.deferReply();

    try {
      if (subcommand === "weekly") {
        const data = await buildWeeklyWrapped(interaction.guildId);
        const embed = renderWrappedEmbed("📊 Weekly Wrapped", data);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === "monthly") {
        const data = await buildMonthlyWrapped(interaction.guildId);
        const embed = renderWrappedEmbed("📊 Monthly Wrapped", data);
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (err) {
      logger.error("Failed to build wrapped", { error: String(err) });
      await interaction.editReply(
        "Something went wrong while building your wrapped. Please try again."
      );
    }
  });

  // 5. Ready — register slash commands for all guilds the bot is in
  client.once(Events.ClientReady, async (readyClient) => {
    logger.info("Discord client ready", { tag: readyClient.user.tag });

    const guildIds = readyClient.guilds.cache.map((g) => g.id);

    if (guildIds.length === 0) {
      logger.warn("Bot is not in any guilds — no slash commands registered");
      return;
    }

    await registerSlashCommands(guildIds);
  });

  // 6. Login
  await client.login(env.DISCORD_TOKEN);

  // 7. Graceful shutdown
  async function shutdown(signal: string) {
    logger.info("Shutting down", { signal });
    await metricsTracker.stop();
    client.destroy();
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error("Fatal error during startup", { error: String(err) });
  process.exit(1);
});
