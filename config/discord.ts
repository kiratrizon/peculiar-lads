import { DiscordConfig } from "configs/@types/index.d.ts";

const constant: DiscordConfig = {
  guild_id: env("DISCORD_GUILD_ID", ""),
};

export default constant;
