import talk from "./commands/talk.ts";
import ping from "./commands/ping.ts";
import schedule from "./commands/schedule.ts";
import profile from "./commands/profile.ts";
import roster from "./commands/roster.ts";
import type { Command } from "./types.ts";

export default {
  talk,
  ping,
  schedule,
  profile,
  roster,
} satisfies Record<string, Command>;
