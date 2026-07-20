import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import type { InteractionDataOption } from "@discordeno/bot";
import { DB } from "Illuminate/Support/Facades/index.ts";
import Character from "App/Models/Character.ts";
import type { AppInteraction, Command } from "../types.ts";

const CLASS_OPTION_NAME = "class";
const NSTG_OPTION_NAME = "nstg";
const MAX_LISTED = 25;
const ROSTER_COLOR = 0x22c55e;

const getOption = (
  options: InteractionDataOption[] | undefined,
  name: string,
) => options?.find((option) => option.name === name)?.value;

const execute = async (interaction: AppInteraction) => {
  const options = interaction.data?.options;
  const classFilter = getOption(options, CLASS_OPTION_NAME);
  const nstgFilter = getOption(options, NSTG_OPTION_NAME);

  const query = Character.query()
    .select(
      "characters.ign",
      "characters.main",
      DB.raw("nstg_level.code as nstg"),
      DB.raw("third_classes.name as class"),
      DB.raw("users.discord as discord"),
    )
    .join("nstg_level", "characters.nstg_level_id", "=", "nstg_level.id")
    .join(
      "third_classes",
      "characters.third_class_id",
      "=",
      "third_classes.id",
    )
    .join("users", "characters.user_id", "=", "users.id");

  if (classFilter) {
    query.where("third_classes.name", "like", `%${classFilter}%`);
  }
  if (nstgFilter) {
    query.where("nstg_level.code", "like", `%${nstgFilter}%`);
  }

  query.orderBy("nstg_level.id", "desc").orderBy("characters.ign", "asc");

  const characters = await query.get();

  if (characters.length === 0) {
    await interaction.respond(
      { content: "No characters match that filter." },
      { isPrivate: true },
    );
    return;
  }

  const lines = characters.slice(0, MAX_LISTED).map((character) => {
    // @ts-ignore //
    const ign = character.ign as string;
    // @ts-ignore //
    const main = Boolean(character.main);
    // @ts-ignore //
    const className = character.class as string;
    // @ts-ignore //
    const nstg = character.nstg as string;
    // `users.discord` is a free-typed username from the recruit application
    // form, not a verified Discord ID, so it can't be rendered as a real
    // <@mention> - show it as plain text instead.
    // @ts-ignore //
    const discordUsername = character.discord as string;

    return `${main ? "⭐" : "•"} **${ign}** (@${discordUsername}) — ${className} (NSTG ${nstg})`;
  });

  const truncatedNotice = characters.length > MAX_LISTED
    ? `\n...and ${characters.length - MAX_LISTED} more. Refine your filters to see more.`
    : "";

  await interaction.respond({
    embeds: [
      {
        title: "Roster",
        description: lines.join("\n") + truncatedNotice,
        color: ROSTER_COLOR,
      },
    ],
  });
};

export default {
  data: {
    name: "roster",
    description: "List guild members' characters, optionally filtered.",
    options: [
      {
        name: CLASS_OPTION_NAME,
        description: "Filter by class name (partial match).",
        type: ApplicationCommandOptionTypes.String,
        required: false,
      },
      {
        name: NSTG_OPTION_NAME,
        description: "Filter by NSTG code (partial match).",
        type: ApplicationCommandOptionTypes.String,
        required: false,
      },
    ],
  },
  execute,
} satisfies Command;
