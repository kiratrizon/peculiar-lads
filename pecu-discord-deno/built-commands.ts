import talk from "./commands/talk.ts";
import ping from "./commands/ping.ts";
import schedule from "./commands/schedule.ts";
import profile from "./commands/profile.ts";
import roster from "./commands/roster.ts";
import sync from "./commands/sync.ts";
import character from "./commands/character.ts";
import scammer from "./commands/scammer.ts";
import signup from "./commands/signup.ts";
import login from "./commands/login.ts";
import promote from "./commands/promote.ts";
import demote from "./commands/demote.ts";
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
  signup,
  login,
  promote,
  demote,
} satisfies Record<string, Command>;
