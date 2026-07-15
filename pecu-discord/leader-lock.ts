import { Redis } from "@upstash/redis";

const LOCK_KEY = "pecu-discord:bot-leader";
const LOCK_TTL_SECONDS = 30;

const redis = new Redis({
  url: env("UPSTASH_REDIS_REST_URL") as string,
  token: env("UPSTASH_REDIS_REST_TOKEN") as string,
});

const instanceId = crypto.randomUUID();

export const tryAcquireLock = async (): Promise<boolean> => {
  try {
    const result = await redis.set(LOCK_KEY, instanceId, {
      nx: true,
      ex: LOCK_TTL_SECONDS,
    });
    return result === "OK";
  } catch (e) {
    console.warn("Failed to attempt leader lock acquisition", e);
    return false;
  }
};

export const renewLock = async (): Promise<"ok" | "lost" | "error"> => {
  try {
    const current = await redis.get<string>(LOCK_KEY);
    if (current !== instanceId) return "lost";
    await redis.expire(LOCK_KEY, LOCK_TTL_SECONDS);
    return "ok";
  } catch (e) {
    console.warn("Failed to renew leader lock", e);
    return "error";
  }
};

export const releaseLock = async (): Promise<void> => {
  try {
    const current = await redis.get<string>(LOCK_KEY);
    if (current === instanceId) {
      await redis.del(LOCK_KEY);
    }
  } catch (e) {
    console.warn("Failed to release leader lock", e);
  }
};
