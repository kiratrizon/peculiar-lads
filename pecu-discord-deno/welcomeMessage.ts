import { AllowedMentionsTypes, ChannelTypes } from "@discordeno/bot";
import { discordRest } from "./rest.ts";
import { buildWelcomeCard } from "./welcome.ts";
import { logErrorToDiscord } from "./errorLog.ts";

// Posting the welcome banner used to happen on guildMemberAdd. It now fires
// only once the recruit has registered on the website and acknowledged the
// Code of Ethics (CodeOfEthicsController.accept), so the channel greets people
// who actually joined rather than everyone who clicked an invite.

const ordinal = (n: number) => {
  const rule = new Intl.PluralRules("en", { type: "ordinal" }).select(n);
  const suffixes: Record<string, string> = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th",
  };
  return `${n}${suffixes[rule] ?? "th"}`;
};

export const sendWelcomeMessage = async (discordId: string): Promise<boolean> => {
  const channelId = env("WELCOME_CHANNEL_ID") as string | null;
  if (!channelId) {
    console.log("WELCOME_CHANNEL_ID is not set, skipping welcome banner.");
    return false;
  }

  const guildId = env("DISCORD_GUILD_ID") as string | null;
  if (!guildId) {
    console.log("DISCORD_GUILD_ID is not set, skipping welcome banner.");
    return false;
  }

  try {
    const channel = await discordRest.getChannel(channelId);
    if (
      channel.type !== ChannelTypes.GuildText &&
      channel.type !== ChannelTypes.GuildAnnouncement
    ) {
      console.log(`Channel ${channelId} is not a text channel.`);
      return false;
    }

    // REST member, not the gateway's transformed one - this runs from the web
    // request, so buildWelcomeCard takes the raw fields instead of an AppMember.
    const member = await discordRest.getMember(guildId, discordId);
    const username = member.user?.username ?? member.nick ?? "there";

    const image = await buildWelcomeCard({
      id: BigInt(discordId),
      username,
      discriminator: member.user?.discriminator ?? "0",
      avatar: member.user?.avatar ?? undefined,
      guildId: BigInt(guildId),
      guildAvatar: member.avatar ?? undefined,
    });

    const guild = await discordRest.getGuild(guildId, { counts: true });
    const memberCount = ordinal(guild.approximateMemberCount ?? 0);

    await discordRest.sendMessage(channelId, {
      content:
        `Welcome <@${discordId}> to PeculiarLads, you are the ${memberCount} member!\n\nPeculiarLads is more than just a guild—we're a family of Dragon Nest SEA players who believe in the power of teamwork, friendship, and adventure.\n\n@everyone`,
      files: [
        {
          blob: new Blob([new Uint8Array(image)], { type: "image/png" }),
          name: "welcome.png",
        },
      ],
      allowedMentions: {
        parse: [
          AllowedMentionsTypes.UserMentions,
          AllowedMentionsTypes.EveryoneMentions,
        ],
      },
    });

    return true;
  } catch (e) {
    console.error("Error sending welcome banner", e);
    logErrorToDiscord("sendWelcomeMessage", e);
    return false;
  }
};
