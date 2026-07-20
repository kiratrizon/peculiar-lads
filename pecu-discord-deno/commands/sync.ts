import User from "App/Models/User.ts";
import type { AppInteraction, Command } from "../types.ts";

const execute = async (interaction: AppInteraction) => {
  const discordId = interaction.user.id.toString();
  const username = interaction.user.username;

  const alreadyLinked = await User.where("discord_id", discordId).first();
  if (alreadyLinked) {
    await interaction.respond(
      { content: "Your Discord is already linked." },
      { isPrivate: true },
    );
    return;
  }

  // Accounts created before discord_id existed only have the free-typed
  // "discord" username field to match on - fragile (self-typed, may be the
  // legacy "name#1234" format), which is exactly why this is a one-time,
  // explicitly-run link step rather than something /profile does on every call.
  const account = await User.where("discord", username).first() ??
    await User.where("discord", "like", `${username}#%`).first();

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

  account.fill({ discord_id: discordId });
  await account.save();

  await interaction.respond(
    { content: "Your Discord account has been linked! You can now use `/profile`." },
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
