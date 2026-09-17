import { discordRest } from "./rest.ts";
import { logErrorToDiscord } from "./errorLog.ts";

export const grantVerifiedRole = async (
  discordId: string,
  reason: string,
): Promise<boolean> => {
  const guildId = env("DISCORD_GUILD_ID") as string | null;
  const verifiedRoleId = env("VERIFIED_ROLE_ID") as string | null;

  if (!guildId || !verifiedRoleId) {
    console.log(
      "DISCORD_GUILD_ID or VERIFIED_ROLE_ID is not set, skipping role grant.",
    );
    return false;
  }

  try {
    const autoRoleId = env("AUTO_ROLE_ID") as string | null;
    const guildMember = await discordRest.getMember(guildId, discordId);

    if (autoRoleId && guildMember.roles.includes(autoRoleId)) {
      await discordRest.removeRole(guildId, discordId, autoRoleId, reason);
    }

    if (!guildMember.roles.includes(verifiedRoleId)) {
      await discordRest.addRole(guildId, discordId, verifiedRoleId, reason);
    }

    return true;
  } catch (error) {
    console.error("Failed to grant the verified role", error);
    logErrorToDiscord("grantVerifiedRole", error);
    return false;
  }
};
