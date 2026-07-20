type status = "online" | "idle" | "dnd" | "offline";

const botStatus: status = "online";

import {
  ActivityTypes,
  AllowedMentionsTypes,
  ChannelTypes,
  createBot,
  createDesiredPropertiesObject,
  GatewayIntents,
  InteractionTypes,
} from "@discordeno/bot";

import builtCommands from "./built-commands.ts";
import type { AppInteraction, Command } from "./types.ts";
import { buildByeImage, buildWelcomeImage } from "./welcome.ts";
import { startScheduledMessagesCron } from "./scheduler.ts";

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

// Mark every transformer property as "desired" so the bot behaves like a
// typical discord.js client (full objects everywhere) instead of having to
// hand-pick every single field discordeno should populate. This also makes
// the resulting Bot type exactly `InternalBot`, which is what types.ts's
// AppInteraction/AppMember/AppUser are derived from.
const desiredProperties = createDesiredPropertiesObject({}, true);

export const bot = createBot({
  token: env("HIRAZYN_TOKEN") as string,
  intents:
    GatewayIntents.Guilds |
    GatewayIntents.GuildMessages |
    GatewayIntents.MessageContent |
    GatewayIntents.GuildMembers,
  desiredProperties,
});

const commands = new Map<string, Command>(
  Object.values(builtCommands).map((command) => [command.data.name, command]),
);

const deployCommands = async () => {
  try {
    const payload = Object.values(builtCommands).map((command) => command.data);

    console.log(`Starting`);

    // Discordeno's helper reads applicationId off the bot itself, so unlike
    // the discord.js version there's no need to pass DISCORD_CLIENT_ID here.
    await bot.helpers.upsertGlobalApplicationCommands(payload);
  } catch (e) {
    console.error(`Error Deploying`, e);
  }
};

const activityTypeMap: Record<string, ActivityTypes> = {
  PLAYING: ActivityTypes.Playing,
  WATCHING: ActivityTypes.Watching,
  LISTENING: ActivityTypes.Listening,
  STREAMING: ActivityTypes.Streaming,
  COMPETING: ActivityTypes.Competing,
};

bot.events.ready = async (payload) => {
  console.log(`Ready! Logged in as ${payload.user.username}`);

  await deployCommands();

  console.log(`Commands deployed globally.`);

  const statusType = botStatus;

  const activityType = (env("ACTIVITY_TYPE") as string | null) || "PLAYING";

  const activityName = (env("ACTIVITY_NAME") as string | null) || "Dragon Nest";

  await bot.gateway.editBotStatus({
    status: statusType,
    activities: [
      {
        name: activityName,
        type: activityTypeMap[activityType] ?? ActivityTypes.Playing,
      },
    ],
  });

  console.log(`Bot status set to: ${statusType}`);
  console.log(`Activity set to ${activityType} ${activityName}`);
};

// Mirrors the discord.js version's "there was an error 1/2" try/catch
// pattern. `interaction.respond()` automatically routes to a followup
// message (and keeps the ephemeral flag) once `acknowledged` is true, so a
// single call covers both branches discord.js needed reply()/followUp() for.
const replyError = async (interaction: AppInteraction) => {
  await interaction.respond(
    {
      content: interaction.acknowledged
        ? "There was an error 1"
        : "There was an error 2",
    },
    { isPrivate: true },
  );
};

bot.events.interactionCreate = async (interaction) => {
  if (interaction.type === InteractionTypes.ModalSubmit) {
    const customId = interaction.data?.customId ?? "";
    const [commandName] = customId.split(":");
    const command = commands.get(commandName);

    if (!command?.handleModal) {
      return;
    }

    try {
      await command.handleModal(interaction);
    } catch (e) {
      console.error(e);
      await replyError(interaction);
    }
    return;
  }

  if (interaction.type !== InteractionTypes.ApplicationCommand) return;

  const command = commands.get(interaction.data?.name ?? "");

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (e) {
    console.error(e);
    await replyError(interaction);
  }
};

bot.events.guildMemberAdd = async (member, user) => {
  try {
    const channelId = env("WELCOME_CHANNEL_ID") as string | null;
    if (!channelId) {
      console.log("WELCOME_CHANNEL_ID is not set, skipping welcome banner.");
      return;
    }

    const channel = await bot.helpers.getChannel(channelId);
    if (
      channel.type !== ChannelTypes.GuildText &&
      channel.type !== ChannelTypes.GuildAnnouncement
    ) {
      console.log(`Channel ${channelId} is not a text channel.`);
      return;
    }

    const image = await buildWelcomeImage(member);
    const guild = await bot.helpers.getGuild(member.guildId, { counts: true });
    const memberCount = ordinal(guild.approximateMemberCount ?? 0);

    await bot.helpers.sendMessage(channelId, {
      content: `Welcome <@${member.id}> to PeculiarLads, you are the ${memberCount} member!\n\nPeculiarLads is more than just a guild—we're a family of Dragon Nest SEA players who believe in the power of teamwork, friendship, and adventure.\n\n@everyone`,
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
  } catch (e) {
    console.error("Error sending welcome banner", e);
  }

  try {
    const joinUrl = new URL(env("PECU_WEB") as string);
    joinUrl.search = new URLSearchParams({
      discord_id: member.id.toString(),
      discord: user.username,
    }).toString();
    joinUrl.hash = "join";

    const dmChannel = await bot.helpers.getDmChannel(user.id);
    await bot.helpers.sendMessage(dmChannel.id, {
      content:
        `Welcome to PeculiarLads! Please fill up your application here: ${joinUrl}`,
    });
  } catch (e) {
    console.error("Error sending application DM to new member", e);
  }

  try {
    const autoRoleId = env("AUTO_ROLE_ID") as string | null;
    if (autoRoleId) {
      await bot.helpers.addRole(member.guildId, user.id, autoRoleId);
    } else {
      console.log("AUTO_ROLE_ID is not set, skipping auto role.");
    }
  } catch (e) {
    console.error("Error assigning auto role", e);
  }
};

const APPLICATION_FIELDS = [
  "Nickname",
  "Country",
  "IGN",
  "Class",
  "NSTG",
  "Previous Guild",
  "Inviter",
];

const hasApplicationFields = (content: string) =>
  APPLICATION_FIELDS.every((field) =>
    new RegExp(`${field}\\s*:`, "i").test(content),
  );

bot.events.messageCreate = async (message) => {
  try {
    if (message.author.bot || !message.guildId) return;

    const onboardingChannelId = env("ONBOARDING_CHANNEL_ID") as string | null;
    if (
      !onboardingChannelId ||
      message.channelId.toString() !== onboardingChannelId
    ) {
      return;
    }

    if (!hasApplicationFields(message.content)) return;

    const autoRoleId = env("AUTO_ROLE_ID") as string | null;
    const verifiedRoleId = env("VERIFIED_ROLE_ID") as string | null;

    if (!autoRoleId || !verifiedRoleId) {
      console.log(
        "AUTO_ROLE_ID or VERIFIED_ROLE_ID is not set, skipping role swap.",
      );
      return;
    }

    const member = message.member;
    if (
      !member ||
      !member.roles.some((roleId) => roleId.toString() === autoRoleId)
    ) {
      return;
    }

    await bot.helpers.removeRole(
      message.guildId,
      message.author.id,
      autoRoleId,
    );
    await bot.helpers.addRole(
      message.guildId,
      message.author.id,
      verifiedRoleId,
    );
  } catch (e) {
    console.error("Error swapping roles on message", e);
  }
};

bot.events.guildMemberRemove = async (user) => {
  try {
    const channelId = env("BYE_CHANNEL_ID") as string | null;
    if (!channelId) {
      console.log("BYE_CHANNEL_ID is not set, skipping bye banner.");
      return;
    }

    const channel = await bot.helpers.getChannel(channelId);
    if (
      channel.type !== ChannelTypes.GuildText &&
      channel.type !== ChannelTypes.GuildAnnouncement
    ) {
      console.log(`Channel ${channelId} is not a text channel.`);
      return;
    }

    const image = await buildByeImage(user);

    await bot.helpers.sendMessage(channelId, {
      files: [
        {
          blob: new Blob([new Uint8Array(image)], { type: "image/png" }),
          name: "bye.png",
        },
      ],
      content: "Salamat, wag ka ng bumalik!",
    });
  } catch (e) {
    console.error("Error sending bye banner", e);
  }
};

startScheduledMessagesCron(bot);

try {
  await bot.start();
} catch (e) {
  console.error("Failed to log in to Discord", e);
  Deno.exit(1);
}
