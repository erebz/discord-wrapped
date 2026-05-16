import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { WrappedData } from "./wrappedQueries";
import { renderWrappedImage } from "./image/renderWrappedImage";
import { renderWrappedEmbed as renderTextEmbed } from "./renderWrappedEmbedText";
import { logger } from "../utils/logger";

interface WrappedResponse {
  embeds: EmbedBuilder[];
  files: AttachmentBuilder[];
}

/**
 * Attempts to render a Wrapped response with a generated image.
 * Falls back to a text-only embed if image generation fails.
 */
export async function renderWrappedResponse(
  title: string,
  subtitle: string,
  data: WrappedData
): Promise<WrappedResponse> {
  try {
    const imageBuffer = await renderWrappedImage(data, title, subtitle);
    const file = new AttachmentBuilder(imageBuffer, { name: "wrapped.png" });
    
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setImage("attachment://wrapped.png")
      .setColor(0x5865F2)
      .setFooter({ text: subtitle })
      .setTimestamp();

    return {
      embeds: [embed],
      files: [file],
    };
  } catch (error) {
    logger.error("Failed to render wrapped image, falling back to text", { error: String(error) });
    
    const textEmbed = renderTextEmbed(title, data);
    return {
      embeds: [textEmbed],
      files: [],
    };
  }
}
