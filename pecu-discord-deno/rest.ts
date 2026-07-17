import { createRestManager } from "@discordeno/bot";

// Gateway-free: unlike main.ts (which opens a Gateway connection and calls
// bot.start()), this only makes REST calls. Anything running on the web/admin
// side (e.g. app/Http/Controllers/*) must import this instead of main.ts -
// importing main.ts there would execute its top-level code too, including
// bot.start(), booting a second Discord connection from the web process.
export const discordRest = createRestManager({
  token: env("HIRAZYN_TOKEN") as string,
});
