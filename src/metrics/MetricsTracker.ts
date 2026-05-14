import { TimeBucketKey, serializeKey } from "./TimeBucket";
import { flushMetrics } from "../db/repositories/metricsRepository";
import { logger } from "../utils/logger";
import { env } from "../config/env";

/**
 * MetricsTracker buffers metric increments in memory.
 *
 * Flushing on every Discord event would hammer SQLite.
 * Instead, we accumulate counts in a Map and flush the whole
 * buffer to the database on a fixed interval.
 */
export class MetricsTracker {
  // Map<serialized key, count>
  private buffer = new Map<string, { key: TimeBucketKey; value: number }>();
  private flushTimer: NodeJS.Timeout | null = null;

  start() {
    this.flushTimer = setInterval(
      () => this.flush(),
      env.METRICS_FLUSH_INTERVAL_MS
    );
    // Don't keep the process alive just for the flush timer
    this.flushTimer.unref();
    logger.info("MetricsTracker started", {
      intervalMs: env.METRICS_FLUSH_INTERVAL_MS,
    });
  }

  /**
   * Increments the counter for a given metric bucket.
   * Safe to call many times per second — no I/O happens here.
   */
  increment(key: TimeBucketKey, amount = 1) {
    const serial = serializeKey(key);
    const existing = this.buffer.get(serial);
    if (existing) {
      existing.value += amount;
    } else {
      this.buffer.set(serial, { key, value: amount });
    }
  }

  /**
   * Writes all buffered metrics to SQLite and clears the buffer.
   * Called automatically on the flush interval, and on shutdown.
   */
  async flush() {
    if (this.buffer.size === 0) return;

    const entries = Array.from(this.buffer.values());
    this.buffer.clear();

    logger.debug("Flushing metrics", { count: entries.length });

    try {
      await flushMetrics(entries);
    } catch (err) {
      // Since we already cleared the buffer, these metrics are lost.
      // In a production app, we might want to put them back or write to a file.
      logger.error("Failed to flush metrics, data lost", {
        error: String(err),
        entryCount: entries.length,
      });
    }
  }

  async stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
    logger.info("MetricsTracker stopped");
  }
}

// Singleton — imported by event handlers
export const metricsTracker = new MetricsTracker();
