import ask from "./commands/ask.ts";
import ping from "./commands/ping.ts";
import type { Command } from "./types.ts";

export default {
  ask,
  ping,
} satisfies Record<string, Command>;
