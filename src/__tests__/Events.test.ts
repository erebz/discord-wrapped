import { describe, it, expect, vi, beforeEach } from "vitest";
import { event as onMessageCreate } from "../discord/events/onMessageCreate";
import { metricsTracker } from "../metrics/MetricsTracker";

vi.mock("../metrics/MetricsTracker", () => ({
  metricsTracker: {
    increment: vi.fn(),
  },
}));

describe("onMessageCreate Event Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should ignore bot messages", () => {
    const mockMessage = {
      inGuild: () => true,
      author: { bot: true },
    } as any;

    onMessageCreate.handler(mockMessage);
    expect(metricsTracker.increment).not.toHaveBeenCalled();
  });

  it("should ignore messages outside guilds", () => {
    const mockMessage = {
      inGuild: () => false,
      author: { bot: false },
    } as any;

    onMessageCreate.handler(mockMessage);
    expect(metricsTracker.increment).not.toHaveBeenCalled();
  });

  it("should track messages from users in guilds", () => {
    const mockMessage = {
      inGuild: () => true,
      guildId: "guild1",
      channelId: "chan1",
      author: { bot: false, id: "user1" },
    } as any;

    onMessageCreate.handler(mockMessage);
    expect(metricsTracker.increment).toHaveBeenCalled();
    const callArgs = vi.mocked(metricsTracker.increment).mock.calls[0][0];
    expect(callArgs.guildId).toBe("guild1");
    expect(callArgs.userId).toBe("user1");
  });
});
