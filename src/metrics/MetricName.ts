export const MetricName = {
  MESSAGES_SENT: "messages.sent",
  REACTIONS_ADDED: "reactions.added",
  EMOJIS_USED: "emojis.used",
} as const;

export type MetricName = (typeof MetricName)[keyof typeof MetricName];
