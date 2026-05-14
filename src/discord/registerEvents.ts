import { Client } from "discord.js";
import { event as onMessageCreate } from "./events/onMessageCreate";
import { event as onMessageReactionAdd } from "./events/onMessageReactionAdd";
import { logger } from "../utils/logger";

/**
 * Registers all Discord event listeners on the client.
 * Add new events here as the project grows.
 */
export function registerEvents(client: Client) {
  // messageCreate
  client.on(onMessageCreate.name, (message) => {
    try {
      onMessageCreate.handler(message);
    } catch (err) {
      logger.error(`Error in ${onMessageCreate.name} event`, { error: String(err) });
    }
  });

  // messageReactionAdd
  client.on(onMessageReactionAdd.name, (reaction, user) => {
    onMessageReactionAdd.handler(reaction as any, user as any).catch((err) => {
      logger.error(`Error in ${onMessageReactionAdd.name} event`, { error: String(err) });
    });
  });

  logger.info("Discord events registered");
}
