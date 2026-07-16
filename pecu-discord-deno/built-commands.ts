import talk from "./commands/talk.ts";
import ping from "./commands/ping.ts";
import type { Command } from "./types.ts";

export default {
  talk,
  ping,
} satisfies Record<string, Command>;
