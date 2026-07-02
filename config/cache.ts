import { CacheConfig } from "configs/@types/index.d.ts";

const constant: CacheConfig = {
  default: env("CACHE_DRIVER", "memory"),
  stores: {
    file: {
      driver: "file",
      path: storagePath("framework/cache/data"),
    },
    sessionFile: {
      driver: "file",
      path: storagePath("framework/sessions"),
    },
    memory: {
      driver: "memory",
    },
    redis: {
      driver: "redis",
      connection: "cache",
    },
  },
};

export default constant;
