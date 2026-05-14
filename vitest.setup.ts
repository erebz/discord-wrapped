import { vi } from "vitest";

// Provide default mock environment variables for tests
// to prevent env.ts from calling process.exit(1)
process.env.DISCORD_TOKEN = "mock_token";
process.env.DATABASE_URL = "file:./data/test.db";
process.env.METRICS_FLUSH_INTERVAL_MS = "1000";

// Mock logger to keep test output clean
vi.mock("./src/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));
