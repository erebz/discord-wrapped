import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  METRICS_FLUSH_INTERVAL_MS: z.coerce.number().default(10_000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
