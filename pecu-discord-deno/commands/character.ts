import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import type { InteractionDataOption } from "@discordeno/bot";
import User from "App/Models/User.ts";
import Character from "App/Models/Character.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";
import type { AppInteraction, Command } from "../types.ts";

const CLASS_OPTION_NAME = "class";
const NSTG_OPTION_NAME = "nstg";
const IGN_OPTION_NAME = "ign";
const MAIN_OPTION_NAME = "main";
const DURATION_MINUTES_OPTION_NAME = "duration_minutes";
const DURATION_SECONDS_OPTION_NAME = "duration_seconds";

const IGN_PATTERN = /^[a-zA-Z0-9]{1,10}$/;
const LIST_COLOR = 0x3b82f6;
const MAX_LISTED = 100;

const getOption = (
  options: InteractionDataOption[] | undefined,
  name: string,
) => options?.find((option) => option.name === name)?.value;

const buildRegisterUrl = (discordId: string, discordUsername: string) => {
  const url = new URL(env("PECU_WEB") as string);
  url.search = new URLSearchParams({
    discord_id: discordId,
    discord: discordUsername,
  }).toString();
  url.hash = "join";
  return url.toString();
};

const handleAdd = async (
  interaction: AppInteraction,
  options: InteractionDataOption[] | undefined,
) => {
  const discordId = interaction.user.id.toString();
  const account = await User.where("discord_id", discordId).first();

  if (!account) {
    await interaction.respond(
      {
        content:
          `Your Discord isn't linked yet. If you've already registered on the website, run \`/sync\` to link it - otherwise register here: ${
            buildRegisterUrl(discordId, interaction.user.username)
          }`,
      },
      { isPrivate: true },
    );
    return;
  }

  // @ts-ignore //
  const status = account.status as number;
  if (status !== 3) {
    await interaction.respond(
      {
        content:
          "Your application hasn't been accepted yet, so you can't add characters.",
      },
      { isPrivate: true },
    );
    return;
  }

  const ign = String(getOption(options, IGN_OPTION_NAME) ?? "").trim();

  if (!IGN_PATTERN.test(ign)) {
    await interaction.respond(
      { content: "IGN must be 1-10 alphanumeric characters." },
      { isPrivate: true },
    );
    return;
  }

  const classId = Number(getOption(options, CLASS_OPTION_NAME));
  const classExists = await ThirdClass.find(classId);
  if (!classExists) {
    await interaction.respond(
      {
        content:
          "That class ID doesn't exist - run `/character classes` to see valid IDs.",
      },
      { isPrivate: true },
    );
    return;
  }

  const nstgId = Number(getOption(options, NSTG_OPTION_NAME));
  const nstgExists = await NSTGLevel.find(nstgId);
  if (!nstgExists) {
    await interaction.respond(
      {
        content:
          "That NSTG ID doesn't exist - run `/character nstg` to see valid IDs.",
      },
      { isPrivate: true },
    );
    return;
  }

  const main = Boolean(getOption(options, MAIN_OPTION_NAME) ?? false);
  const durationMinutes = getOption(options, DURATION_MINUTES_OPTION_NAME);
  const durationSeconds = getOption(options, DURATION_SECONDS_OPTION_NAME);
  const hasDuration = durationMinutes !== undefined ||
    durationSeconds !== undefined;
  const duration = hasDuration
    ? Math.max(0, Number(durationMinutes) || 0) * 60 +
      Math.max(0, Math.min(59, Number(durationSeconds) || 0))
    : undefined;

  // @ts-ignore //
  const accountId = account.id as number;

  await Character.create({
    user_id: accountId,
    main,
    third_class_id: classId,
    nstg_level_id: nstgId,
    ign,
    duration,
  });

  await interaction.respond(
    {
      content:
        // @ts-ignore //
        `Added **${ign}** (${classExists.name as string}, NSTG ${nstgExists.code as string}). You can also manage your characters on the website: ${env("PECU_WEB")}characters`,
    },
    { isPrivate: true },
  );
};

const handleClasses = async (interaction: AppInteraction) => {
  const classes = await ThirdClass.all();
  const lines = classes.slice(0, MAX_LISTED).map((classRow) => {
    // @ts-ignore //
    const id = classRow.id as number;
    // @ts-ignore //
    const name = classRow.name as string;
    return `**${id}** - ${name}`;
  });

  const truncatedNotice = classes.length > MAX_LISTED
    ? `\n...and ${classes.length - MAX_LISTED} more.`
    : "";

  await interaction.respond(
    {
      embeds: [
        {
          title: "Classes",
          description: lines.join("\n") + truncatedNotice,
          color: LIST_COLOR,
        },
      ],
    },
    { isPrivate: true },
  );
};

const handleNstg = async (interaction: AppInteraction) => {
  const levels = await NSTGLevel.all();
  const lines = levels.slice(0, MAX_LISTED).map((level) => {
    // @ts-ignore //
    const id = level.id as number;
    // @ts-ignore //
    const code = level.code as string;
    // @ts-ignore //
    const name = level.name as string;
    return `**${id}** - ${code} (${name})`;
  });

  const truncatedNotice = levels.length > MAX_LISTED
    ? `\n...and ${levels.length - MAX_LISTED} more.`
    : "";

  await interaction.respond(
    {
      embeds: [
        {
          title: "NSTG Levels",
          description: lines.join("\n") + truncatedNotice,
          color: LIST_COLOR,
        },
      ],
    },
    { isPrivate: true },
  );
};

const execute = async (interaction: AppInteraction) => {
  const subcommand = interaction.data?.options?.[0];
  switch (subcommand?.name) {
    case "add":
      await handleAdd(interaction, subcommand.options);
      break;
    case "classes":
      await handleClasses(interaction);
      break;
    case "nstg":
      await handleNstg(interaction);
      break;
  }
};

export default {
  data: {
    name: "character",
    description: "Manage your characters.",
    options: [
      {
        name: "add",
        description: "Add one of your characters.",
        type: ApplicationCommandOptionTypes.SubCommand,
        options: [
          {
            name: CLASS_OPTION_NAME,
            description: "Class ID - see /character classes.",
            type: ApplicationCommandOptionTypes.Integer,
            required: true,
          },
          {
            name: NSTG_OPTION_NAME,
            description: "NSTG ID - see /character nstg.",
            type: ApplicationCommandOptionTypes.Integer,
            required: true,
          },
          {
            name: IGN_OPTION_NAME,
            description: "Your character's in-game name.",
            type: ApplicationCommandOptionTypes.String,
            required: true,
          },
          {
            name: MAIN_OPTION_NAME,
            description: "Is this your main character?",
            type: ApplicationCommandOptionTypes.Boolean,
            required: false,
          },
          {
            name: DURATION_MINUTES_OPTION_NAME,
            description: "Clear time - minutes (optional).",
            type: ApplicationCommandOptionTypes.Integer,
            required: false,
          },
          {
            name: DURATION_SECONDS_OPTION_NAME,
            description: "Clear time - seconds (optional).",
            type: ApplicationCommandOptionTypes.Integer,
            required: false,
          },
        ],
      },
      {
        name: "classes",
        description: "List all class IDs.",
        type: ApplicationCommandOptionTypes.SubCommand,
      },
      {
        name: "nstg",
        description: "List all NSTG level IDs.",
        type: ApplicationCommandOptionTypes.SubCommand,
      },
    ],
  },
  execute,
} satisfies Command;
