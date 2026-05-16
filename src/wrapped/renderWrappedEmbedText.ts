import { EmbedBuilder } from "discord.js";
import { WrappedData } from "./wrappedQueries";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatPeakHour(hour: number | null): string {
  if (hour === null) return "N/A";
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatChannel(channelId: string | null): string {
  if (!channelId) return "N/A";
  return `<#${channelId}>`;
}

function formatMember(userId: string | null): string {
  if (!userId) return "N/A";
  return `<@${userId}>`;
}

function formatEmoji(emoji: { name: string; id: string | null; isAnimated: boolean } | null): string {
  if (!emoji || !emoji.name) return "N/A";
  if (emoji.id) {
    const prefix = emoji.isAnimated ? "a" : "";
    return `<${prefix}:${emoji.name}:${emoji.id}> **${emoji.name}**`;
  }
  // Standard Unicode emoji
  return `${emoji.name} **${emoji.name}**`;
}

export function renderWrappedEmbed(
  title: string,
  data: WrappedData
): EmbedBuilder {
  const topUsersList = data.topUsers.length > 0
    ? data.topUsers
        .map(
          (u, i) =>
            `${i + 1}. ${formatMember(u.userId)} — **${formatNumber(u.count)}**`
        )
        .join("\n")
    : "No data available";

  const description = [
    `📨 **${formatNumber(data.totalMessages)}** messages sent`,
    `👥 **${formatNumber(data.activeMembers)}** active members`,
    `💬 Top channel: ${formatChannel(data.topChannel)}`,
    `📅 Busiest day: **${data.busiestDay ?? "N/A"}**`,
    `⏰ Peak hour: **${formatPeakHour(data.peakHour)}**`,
    ``,
    `🥇 **Top 3 Active Members**`,
    topUsersList,
    ``,
    `⚡ **${formatNumber(data.totalReactions)}** reactions added`,
    `🏆 Top emoji: ${formatEmoji(data.topEmoji)}`,
    `🔥 Most reactive member: ${formatMember(data.mostReactiveMember)}`,
  ].join("\n");

  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x5865f2) // Discord blurple
    .setTimestamp();
}
