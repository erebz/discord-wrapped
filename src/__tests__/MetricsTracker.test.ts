import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MetricsTracker } from "../metrics/MetricsTracker";
import { MetricName } from "../metrics/MetricName";
import * as metricsRepo from "../db/repositories/metricsRepository";

// Mock the repository to avoid DB calls during unit tests
vi.mock("../db/repositories/metricsRepository", () => ({
  flushMetrics: vi.fn().mockResolvedValue(undefined),
}));

describe("MetricsTracker", () => {
  let tracker: MetricsTracker;

  beforeEach(() => {
    tracker = new MetricsTracker();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await tracker.stop();
  });

  it("should buffer increments", async () => {
    const key = {
      guildId: "g1",
      metricName: MetricName.MESSAGES_SENT,
      bucketStart: "2024-03-20T15:00:00.000Z",
    };

    tracker.increment(key, 1);
    tracker.increment(key, 2);

    // Accessing private buffer for testing purposes
    const buffer = (tracker as any).buffer;
    expect(buffer.size).toBe(1);
    expect(Array.from(buffer.values())[0].value).toBe(3);
  });

  it("should flush buffered metrics", async () => {
    const key = {
      guildId: "g1",
      metricName: MetricName.MESSAGES_SENT,
      bucketStart: "2024-03-20T15:00:00.000Z",
    };

    tracker.increment(key, 5);
    await tracker.flush();

    expect(metricsRepo.flushMetrics).toHaveBeenCalledWith([
      { key, value: 5 },
    ]);
    expect((tracker as any).buffer.size).toBe(0);
  });

  it("should not flush if buffer is empty", async () => {
    await tracker.flush();
    expect(metricsRepo.flushMetrics).not.toHaveBeenCalled();
  });

  it("should handle flush errors without crashing", async () => {
    const key = {
      guildId: "g1",
      metricName: MetricName.MESSAGES_SENT,
      bucketStart: "2024-03-20T15:00:00.000Z",
    };

    vi.mocked(metricsRepo.flushMetrics).mockRejectedValueOnce(new Error("DB Down"));
    
    tracker.increment(key, 1);
    await tracker.flush(); // Should catch internal error

    expect(metricsRepo.flushMetrics).toHaveBeenCalled();
    expect((tracker as any).buffer.size).toBe(0);
  });
});
