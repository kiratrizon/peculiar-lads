import User from "App/Models/User.ts";

// Shared by /profile, /sync, /character add - resolves a Discord user to
// their User row, auto-linking legacy accounts matched by the free-typed
// `discord` username field (the same fallback /sync always used) so members
// don't have to manually run /sync before anything else works.
export const resolveDiscordAccount = async (
  discordId: string,
  username: string,
) => {
  const byDiscordId = await User.where("discord_id", discordId).first();
  if (byDiscordId) return byDiscordId;

  const legacyMatch = await User.where("discord", username).first() ??
    await User.where("discord", "like", `${username}#%`).first();

  if (legacyMatch) {
    legacyMatch.fill({ discord_id: discordId });
    await legacyMatch.save();
  }

  return legacyMatch;
};
