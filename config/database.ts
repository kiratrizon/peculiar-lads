import { DatabaseConfig } from "configs/@types/index.d.ts";

const constant: DatabaseConfig = {
  default: env("DB_CONNECTION", "sqlite"),

  connections: {
    mysql: {
      driver: "mysql",
      host: env("DB_HOST", "127.0.0.1"),
      port: env("DB_PORT", 3306),
      user: env("DB_USERNAME", "root"),
      password: env("DB_PASSWORD", ""),
      database: env("DB_DATABASE", "honovel"),
      charset: "utf8mb4",
      options: {
        maxConnection: 4,
      },
    },
    sqlite: {
      driver: "sqlite",
      database: databasePath("database.sqlite"),
    },
  },

  redis: {
    default: "cache", // use cache in connections
    connections: {
      cache: {
        driver: "upstash",
        upstashUrl: env("UPSTASH_REDIS_REST_URL", ""),
        upstashToken: env("UPSTASH_REDIS_REST_TOKEN", ""),
      },
      session: {
        driver: "ioredis",
        ioredisUrl: env("REDIS_URL", ""),
      },
    },
  },
};

export default constant;
