import { describe, it, expect, beforeEach, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { metricBuckets } from "../db/schema";
import { MetricName } from "../metrics/MetricName";
import { queryWrappedData } from "../wrapped/wrappedQueries";
import { flushMetrics } from "../db/repositories/metricsRepository";
import { sql } from "drizzle-orm";

// We need to inject the test DB into the components
// Since the project uses a singleton 'db' in connection.ts, we have to mock it
import * as connection from "../db/connection";

describe("Database Repositories and Queries", () => {
  let testDb: any;

  beforeEach(async () => {
    const sqlite = new Database(":memory:");
    testDb = drizzle(sqlite);
    
    // Run migrations on in-memory DB
    migrate(testDb, { migrationsFolder: "./drizzle" });

    // Patch the connection singleton for the duration of these tests
    connection.setTestDb(testDb);
  });

  it("should flush metrics to the database", async () => {
    const entry = {
      key: {
        guildId: "g1",
        metricName: MetricName.MESSAGES_SENT,
        bucketStart: "2024-03-20T15:00:00.000Z",
        channelId: "c1",
        userId: "u1",
        isAnimated: false,
      },
      value: 10,
    };

    await flushMetrics([entry]);

    const rows = await testDb.select().from(metricBuckets);
    expect(rows.length).toBe(1);
    expect(rows[0].value).toBe(10);
    expect(rows[0].guildId).toBe("g1");
  });

  it("should aggregate data correctly in queryWrappedData", async () => {
    const start = new Date("2024-03-01T00:00:00Z");
    const end = new Date("2024-04-01T00:00:00Z");

    await testDb.insert(metricBuckets).values([
      {
        guildId: "g1",
        metricName: MetricName.MESSAGES_SENT,
        bucketStart: "2024-03-20T15:00:00.000Z",
        value: 5,
        userId: "userA",
        channelId: "chan1",
      },
      {
        guildId: "g1",
        metricName: MetricName.MESSAGES_SENT,
        bucketStart: "2024-03-20T16:00:00.000Z",
        value: 10,
        userId: "userA",
        channelId: "chan1",
      },
      {
        guildId: "g1",
        metricName: MetricName.MESSAGES_SENT,
        bucketStart: "2024-03-21T10:00:00.000Z",
        value: 3,
        userId: "userB",
        channelId: "chan2",
      },
      {
        guildId: "g1",
        metricName: MetricName.REACTIONS_ADDED,
        bucketStart: "2024-03-21T10:00:00.000Z",
        value: 7,
        userId: "userB",
      },
    ]);

    const data = await queryWrappedData("g1", start, end);

    expect(data.totalMessages).toBe(18);
    expect(data.activeMembers).toBe(2);
    expect(data.totalReactions).toBe(7);
    expect(data.topUsers[0].userId).toBe("userA");
    expect(data.topUsers[0].count).toBe(15);
  });
});
