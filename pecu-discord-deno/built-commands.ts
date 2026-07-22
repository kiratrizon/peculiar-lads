import talk from "./commands/talk.ts";
import ping from "./commands/ping.ts";
import schedule from "./commands/schedule.ts";
import profile from "./commands/profile.ts";
import roster from "./commands/roster.ts";
import sync from "./commands/sync.ts";
import character from "./commands/character.ts";
import scammer from "./commands/scammer.ts";
import type { Command } from "./types.ts";

export default {
  talk,
  ping,
  schedule,
  profile,
  roster,
  sync,
  character,
  scammer,
} satisfies Record<string, Command>;
