import { resolveDiscordAccount } from "../discordAccount.ts";
import type { AppInteraction, Command } from "../types.ts";

const execute = async (interaction: AppInteraction) => {
  const discordId = interaction.user.id.toString();
  const username = interaction.user.username;

  // /profile and /character add already auto-link via the same fallback
  // below, so this command is now mostly a "am I linked yet, and if not why"
  // check rather than the only way to link - signup isn't required to use
  // either of those anymore.
  const account = await resolveDiscordAccount(discordId, username);

  if (!account) {
    const url = new URL(env("PECU_WEB") as string);
    url.search = new URLSearchParams({
      discord_id: discordId,
      discord: username,
    }).toString();
    url.hash = "join";
    await interaction.respond(
      {
        content:
          `No account found for your Discord username. Please register here: ${url}`,
      },
      { isPrivate: true },
    );
    return;
  }

  await interaction.respond(
    { content: "Your Discord account is linked. You can now use `/profile`." },
    { isPrivate: true },
  );
};

export default {
  data: {
    name: "sync",
    description: "Link your Discord account to your website registration.",
  },
  execute,
} satisfies Command;
