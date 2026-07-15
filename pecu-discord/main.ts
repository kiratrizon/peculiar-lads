type status = "online" | "idle" | "invisible";

const botStatus: status = "online";

import { REST, Routes } from "discord.js";
import builtCommands from "./built-commands.ts";
import type { Command } from "./types.ts";

const deployCommands = async () => {
  try {
    const commands = [];

    for (const command of Object.values(builtCommands)) {
      commands.push(command.data.toJSON());
    }

    const rest = new REST().setToken(env("HIRAZYN_TOKEN") as string);
    console.log(`Starting`);

    const data = await rest.put(
      Routes.applicationCommands(env("DISCORD_CLIENT_ID") as string),
      {
        body: commands,
      },
    );
  } catch (e) {
    console.error(`Error Deploying`, e);
  }
};

import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActivityType,
  PresenceUpdateStatus,
  Events,
} from "discord.js";

import { buildWelcomeImage, buildByeImage } from "./welcome.ts";

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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
  ],
}) as Client & { commands: Collection<string, Command> };

const addObj = {
  commands: new Collection(),
};

Object.assign(client, addObj);

for (const command of Object.values(builtCommands)) {
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async () => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);

  await deployCommands();

  console.log(`Commands deployed globally.`);

  const statusType = botStatus;

  const activityType = env("ACTIVITY_TYPE") || "PLAYING";

  const activityName = env("ACTIVITY_NAME") || "Discord";

  const activityTypeMap = {
    PLAYING: ActivityType.Playing,
    WATCHING: ActivityType.Watching,
    LISTENING: ActivityType.Listening,
    STREAMING: ActivityType.Streaming,
    COMPETING: ActivityType.Competing,
  };

  const statusMap = {
    online: PresenceUpdateStatus.Online,
    idle: PresenceUpdateStatus.Idle,
    dnd: PresenceUpdateStatus.DoNotDisturb,
    invisible: PresenceUpdateStatus.Invisible,
    offline: PresenceUpdateStatus.Offline,
  };

  client.user?.setPresence({
    status: statusMap[statusType],
    activities: [
      {
        name: activityName,
        type: activityTypeMap[activityType],
      },
    ],
  });

  console.log(`Bot status set to: ${statusType}`);
  console.log(`Activity set to ${activityType} ${activityName}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isModalSubmit()) {
    const [commandName] = interaction.customId.split(":");
    const command = client.commands.get(commandName);

    if (!command?.handleModal) {
      return;
    }

    try {
      await command.handleModal(interaction);
    } catch (e) {
      console.error(e);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error 1",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error 2",
          ephemeral: true,
        });
      }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction?.commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (e) {
    console.error(e);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error 1",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error 2",
        ephemeral: true,
      });
    }
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channelId = env("WELCOME_CHANNEL_ID");
    if (!channelId) {
      console.log("WELCOME_CHANNEL_ID is not set, skipping welcome banner.");
      return;
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel?.isSendable()) {
      console.log(`Channel ${channelId} is not a text channel.`);
      return;
    }

    const image = await buildWelcomeImage(member);
    const memberCount = ordinal(member.guild.memberCount);

    await channel.send({
      content: `Welcome <@${member.id}> to PeculiarLads, you are the ${memberCount} member!\n\nPeculiarLads is more than just a guild—we're a family of Dragon Nest SEA players who believe in the power of teamwork, friendship, and adventure.\n\n@everyone`,
      files: [{ attachment: image, name: "welcome.png" }],
      allowedMentions: { parse: ["users", "everyone"] },
    });
  } catch (e) {
    console.error("Error sending welcome banner", e);
  }

  try {
    const autoRoleId = env("AUTO_ROLE_ID");
    if (autoRoleId) {
      await member.roles.add(autoRoleId);
    } else {
      console.log("AUTO_ROLE_ID is not set, skipping auto role.");
    }
  } catch (e) {
    console.error("Error assigning auto role", e);
  }
});

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

client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.author.bot || !message.inGuild()) return;

    const onboardingChannelId = env("ONBOARDING_CHANNEL_ID");
    if (!onboardingChannelId || message.channelId !== onboardingChannelId) {
      return;
    }

    if (!hasApplicationFields(message.content)) return;

    const autoRoleId = env("AUTO_ROLE_ID");
    const verifiedRoleId = env("VERIFIED_ROLE_ID");

    if (!autoRoleId || !verifiedRoleId) {
      console.log(
        "AUTO_ROLE_ID or VERIFIED_ROLE_ID is not set, skipping role swap.",
      );
      return;
    }

    const member = message.member;
    if (!member || !member.roles.cache.has(autoRoleId)) return;

    await member.roles.remove(autoRoleId);
    await member.roles.add(verifiedRoleId);
  } catch (e) {
    console.error("Error swapping roles on message", e);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  try {
    const channelId = env("BYE_CHANNEL_ID");
    if (!channelId) {
      console.log("BYE_CHANNEL_ID is not set, skipping bye banner.");
      return;
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel?.isSendable()) {
      console.log(`Channel ${channelId} is not a text channel.`);
      return;
    }

    const image = await buildByeImage(member);

    await channel.send({
      files: [{ attachment: image, name: "bye.png" }],
      content: "Salamat, wag ka ng bumalik!",
    });
  } catch (e) {
    console.error("Error sending bye banner", e);
  }
});

try {
  await client.login(env("HIRAZYN_TOKEN") as string);
} catch (e) {
  console.error("Failed to log in to Discord", e);
  Deno.exit(1);
}
