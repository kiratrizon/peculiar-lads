import {
  ApplicationCommandOptionTypes,
  memberAvatarUrl,
} from "@discordeno/bot";
import { discordRest } from "../rest.ts";
import type { AppInteraction, Command } from "../types.ts";

const MEMBER_OPTION_NAME = "member";

const execute = async (interaction: AppInteraction) => {
  const memberOptionValue = interaction.data?.options?.find(
    (option) => option.name === MEMBER_OPTION_NAME,
  )?.value;
  const guildId = interaction.guildId;

  if (!memberOptionValue || !guildId) {
    await interaction.respond(
      {
        content:
          "This command must be used in a server with a mentioned member.",
      },
      { isPrivate: true },
    );
    return;
  }

  const memberId = String(memberOptionValue);
  const member = await discordRest.getMember(String(guildId), memberId);

  if (!member.avatar) {
    await interaction.respond({
      content: `<@${memberId}> does not have a server avatar in this server.`,
    });
    return;
  }

  // No `format` for animated avatars: discordeno only falls back to gif when
  // the caller leaves it unset, so hardcoding png would freeze them.
  const avatarUrl = memberAvatarUrl(String(guildId), memberId, {
    avatar: member.avatar,
    size: 1024,
    ...(member.avatar.startsWith("a_") ? {} : { format: "png" as const }),
  });

  if (!avatarUrl) {
    await interaction.respond({
      content: `Could not build an avatar link for <@${memberId}>.`,
    });
    return;
  }

  const username =
    interaction.data?.resolved?.users?.get(BigInt(memberId))?.username ??
    memberId;

  await interaction.respond({
    embeds: [
      {
        title: `${username}'s Server Avatar`,
        image: { url: avatarUrl },
      },
    ],
  });
};

export default {
  data: {
    name: "avatar",
    description: "Show a member's current server avatar.",
    options: [
      {
        name: MEMBER_OPTION_NAME,
        description: "The member whose server avatar to show.",
        type: ApplicationCommandOptionTypes.User,
        required: true,
      },
    ],
  },
  execute,
} satisfies Command;
