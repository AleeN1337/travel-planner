import { Redis } from "@upstash/redis";

export type RateLimitCategory =
  | "generate"
  | "ai"
  | "tripAi"
  | "api";

const LIMITS: Record<
  RateLimitCategory,
  { limit: number; windowSec: number; label: string }
> = {
  generate: { limit: 5, windowSec: 3600, label: "generowanie planu" },
  ai: { limit: 45, windowSec: 3600, label: "funkcje AI" },
  tripAi: { limit: 25, windowSec: 3600, label: "kreator (AI)" },
  api: { limit: 120, windowSec: 60, label: "operacje na planie" },
};

type MemoryEntry = { count: number; resetAt: number };

const memoryStore = new Map<string, MemoryEntry>();

let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redisClient = new Redis({ url, token });
  } else {
    redisClient = null;
  }
  return redisClient;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return {
    ok: true,
    remaining: limit - entry.count,
    retryAfterSec: 0,
  };
}

async function redisRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; remaining: number; retryAfterSec: number }> {
  const redis = getRedis();
  if (!redis) {
    return memoryRateLimit(key, limit, windowSec);
  }

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSec);
  }

  if (count > limit) {
    const ttl = await redis.ttl(key);
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: ttl > 0 ? ttl : windowSec,
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - count),
    retryAfterSec: 0,
  };
}

export async function checkRateLimit(
  identifier: string,
  category: RateLimitCategory,
): Promise<{
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
  limit: number;
  label: string;
}> {
  const config = LIMITS[category];
  const key = `tp:rl:${category}:${identifier}`;
  const result = await redisRateLimit(key, config.limit, config.windowSec);

  return {
    ...result,
    limit: config.limit,
    label: config.label,
  };
}

export function isRateLimitEnabled(): boolean {
  return true;
}

export function rateLimitBackend(): "redis" | "memory" {
  return getRedis() ? "redis" : "memory";
}
