import { resolveDiscordAccount } from "../discordAccount.ts";
import type { AppInteraction, Command } from "../types.ts";

const execute = async (interaction: AppInteraction) => {
  const discordId = interaction.user.id.toString();
  const username = interaction.user.username;

  const account = await resolveDiscordAccount(discordId, username);

  if (!account) {
    await interaction.respond(
      {
        content:
          "You don't have a profile yet. Run `/character add` first to create one.",
      },
      { isPrivate: true },
    );
    return;
  }

  // @ts-ignore //
  const status = account.status as number;
  if (status === 2) {
    await interaction.respond(
      {
        content:
          "Your application was rejected, so a signup link can't be issued. Contact an officer if you think this is a mistake.",
      },
      { isPrivate: true },
    );
    return;
  }

  // @ts-ignore //
  const password = account.password as string | null;
  if (password) {
    await interaction.respond(
      {
        content:
          `You're already signed up! Use \`/login\` to get your login link, or visit: ${env("PECU_WEB")}login`,
      },
      { isPrivate: true },
    );
    return;
  }

  // @ts-ignore //
  let invitationLink = account.invitation_link as string | null;
  if (!invitationLink) {
    // @ts-ignore //
    const accountId = account.id as number;
    invitationLink = `${accountId}-${date("YmdHis")}-${crypto.randomUUID()}`;
  }

  // The website's /signup/{link} route only matches rows with status 1
  // ("invited") - accounts fast-tracked to 3 by /character add need this
  // flipped back to 1 so that lookup finds them. Completing signup resets
  // status to 3 again on the website side, so this is a temporary detour,
  // not a regression - and while mid-signup, this account is briefly
  // invisible to status=3-only listings (e.g. /roster) until they finish.
  account.fill({ invitation_link: invitationLink, status: 1 });
  await account.save();

  const signupUrl = `${env("PECU_WEB")}signup/${invitationLink}`;

  await interaction.respond(
    { content: `Complete your signup here: ${signupUrl}` },
    { isPrivate: true },
  );
};

export default {
  data: {
    name: "signup",
    description: "Get your website signup link.",
  },
  execute,
} satisfies Command;
