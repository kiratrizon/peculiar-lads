import { resolveDiscordAccount } from "../discordAccount.ts";
import type { AppInteraction, Command } from "../types.ts";

const execute = async (interaction: AppInteraction) => {
  const discordId = interaction.user.id.toString();
  const username = interaction.user.username;

  const account = await resolveDiscordAccount(discordId, username);
  // @ts-ignore //
  const password = account?.password as string | null | undefined;

  if (!account || !password) {
    await interaction.respond(
      {
        content:
          "You haven't signed up yet - run `/signup` first to get your signup link.",
      },
      { isPrivate: true },
    );
    return;
  }

  await interaction.respond(
    { content: `Log in here: ${env("PECU_WEB")}login` },
    { isPrivate: true },
  );
};

export default {
  data: {
    name: "login",
    description: "Get your website login link.",
  },
  execute,
} satisfies Command;
