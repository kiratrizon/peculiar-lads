import {
  ApplicationCommandOptionTypes,
  avatarUrl,
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

  // Both hashes come from the REST response, so they are plain strings. The
  // interaction's resolved users are NOT usable here: the transformer converts
  // their avatar to a bigint, which does not interpolate into a CDN path.
  const user = member.user;

  // No `format` for animated avatars: discordeno only falls back to gif when
  // the caller leaves it unset, so hardcoding png would freeze them.
  const formatFor = (hash?: string) =>
    hash?.startsWith("a_") ? {} : { format: "png" as const };

  const serverAvatarLink = member.avatar
    ? memberAvatarUrl(String(guildId), memberId, {
        avatar: member.avatar,
        size: 1024,
        ...formatFor(member.avatar),
      })
    : undefined;

  const globalAvatar = user?.avatar ?? undefined;

  const avatarLink =
    serverAvatarLink ??
    avatarUrl(memberId, user?.discriminator ?? "0", {
      avatar: globalAvatar,
      size: 1024,
      ...formatFor(globalAvatar),
    });

  const username = user?.username ?? memberId;

  await interaction.respond({
    embeds: [
      {
        title: serverAvatarLink
          ? `${username}'s Server Avatar`
          : `${username}'s Avatar`,
        image: { url: avatarLink },
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
