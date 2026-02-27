import { CacheConfig } from "configs/@types/index.d.ts";

const constant: CacheConfig = {
  default: env("CACHE_DRIVER", "memory"),
  stores: {
    file: {
      driver: "file",
      path: storagePath("framework/cache/data"),
    },
    memory: {
      driver: "memory",
    },
  },
};

export default constant;
