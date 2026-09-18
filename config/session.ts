import { Str } from "Illuminate/Support/index.ts";
import { SessionConfig } from "configs/@types/index.d.ts";
const constant: SessionConfig = {
  driver: env("SESSION_DRIVER", "database"),

  lifetime: env("SESSION_LIFETIME", 120),

  expireOnClose: env("SESSION_EXPIRE_ON_CLOSE", false),

  encrypt: env("SESSION_ENCRYPT", true),

  files: storagePath("framework/sessions"),

  connection: env("SESSION_CONNECTION"),

  table: env("SESSION_TABLE", "sessions"),

  store: env("SESSION_STORE"),

  lottery: [2, 100],

  cookie: env(
    "SESSION_COOKIE",
    Str.snake(env("APP_NAME", "honovel")) + "_session"
  ),

  path: env("SESSION_PATH", "/"),

  domain: env("SESSION_DOMAIN"),

  // Defaults to on in production so the cookie is never sent over plaintext,
  // while local http:// development still receives it.
  secure: env("SESSION_SECURE_COOKIE", IS_PRODUCTION),

  // Nothing in the frontend reads the session cookie, so keep it away from JS.
  httpOnly: env("SESSION_HTTP_ONLY", true),

  sameSite: env("SESSION_SAME_SITE", "lax"),

  partitioned: env("SESSION_PARTITIONED_COOKIE", false),
};

export default constant;
