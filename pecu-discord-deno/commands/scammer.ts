import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import type { InteractionDataOption } from "@discordeno/bot";
import { DB } from "Illuminate/Support/Facades/index.ts";
import BlockListedPlayer from "App/Models/BlockListedPlayer.ts";
import type { AppInteraction, Command } from "../types.ts";

const IGN_OPTION_NAME = "ign";
const REASON_OPTION_NAME = "reason";

const IGN_PATTERN = /^[a-zA-Z0-9]{1,10}$/;
const LIST_COLOR = 0xdc2626;
const MAX_LISTED = 50;

const getOption = (
  options: InteractionDataOption[] | undefined,
  name: string,
) => options?.find((option) => option.name === name)?.value;

const handleAdd = async (
  interaction: AppInteraction,
  options: InteractionDataOption[] | undefined,
) => {
  const ign = String(getOption(options, IGN_OPTION_NAME) ?? "").trim();
  const reasonOption = getOption(options, REASON_OPTION_NAME);

  if (!IGN_PATTERN.test(ign)) {
    await interaction.respond(
      { content: "IGN must be 1-10 alphanumeric characters." },
      { isPrivate: true },
    );
    return;
  }

  const existing = await BlockListedPlayer.whereRaw(DB.raw(`lower(ign) = ?`), [
    ign.toLowerCase(),
  ]).first();

  if (existing) {
    await interaction.respond(
      { content: `**${ign}** is already on the scammer list.` },
      { isPrivate: true },
    );
    return;
  }

  await BlockListedPlayer.create({
    ign,
    reason: reasonOption ? String(reasonOption) : undefined,
  });

  await interaction.respond(
    { content: `Added **${ign}** to the scammer list.` },
    { isPrivate: true },
  );
};

const handleList = async (interaction: AppInteraction) => {
  const players = await BlockListedPlayer.all();

  if (players.length === 0) {
    await interaction.respond(
      { content: "The scammer list is empty." },
      { isPrivate: false },
    );
    return;
  }

  const lines = players.slice(0, MAX_LISTED).map((player) => {
    // @ts-ignore //
    const ign = player.ign as string;
    // @ts-ignore //
    const reason = player.reason as string | null;
    return `**${ign}**${reason ? ` — ${reason}` : ""}`;
  });

  const truncatedNotice =
    players.length > MAX_LISTED
      ? `\n...and ${players.length - MAX_LISTED} more.`
      : "";

  await interaction.respond(
    {
      embeds: [
        {
          title: "Scammer List",
          description: lines.join("\n") + truncatedNotice,
          color: LIST_COLOR,
        },
      ],
    },
    { isPrivate: false },
  );
};

const execute = async (interaction: AppInteraction) => {
  const subcommand = interaction.data?.options?.[0];
  switch (subcommand?.name) {
    case "add":
      await handleAdd(interaction, subcommand.options);
      break;
    case "list":
      await handleList(interaction);
      break;
  }
};

export default {
  data: {
    name: "scammer",
    description: "Manage the guild's scammer list.",
    options: [
      {
        name: "add",
        description: "Add a player to the scammer list.",
        type: ApplicationCommandOptionTypes.SubCommand,
        options: [
          {
            name: IGN_OPTION_NAME,
            description: "The scammer's in-game name.",
            type: ApplicationCommandOptionTypes.String,
            required: true,
          },
          {
            name: REASON_OPTION_NAME,
            description: "Why they're being listed (optional).",
            type: ApplicationCommandOptionTypes.String,
            required: false,
          },
        ],
      },
      {
        name: "list",
        description: "List everyone on the scammer list.",
        type: ApplicationCommandOptionTypes.SubCommand,
      },
    ],
  },
  execute,
} satisfies Command;
