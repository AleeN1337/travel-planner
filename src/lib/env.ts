import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1).optional(),
  MAPBOX_ACCESS_TOKEN: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  return envSchema.parse(process.env);
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
