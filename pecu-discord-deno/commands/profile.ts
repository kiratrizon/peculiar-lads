import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import { DB } from "Illuminate/Support/Facades/index.ts";
import User from "App/Models/User.ts";
import Character from "App/Models/Character.ts";
import type { AppInteraction, Command } from "../types.ts";

const MEMBER_OPTION_NAME = "member";
const PROFILE_COLOR = 0x8b5cf6;

const formatDuration = (seconds: number | null): string | null => {
  if (seconds === null || seconds === undefined) return null;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

const execute = async (interaction: AppInteraction) => {
  const memberOptionValue = interaction.data?.options?.find(
    (option) => option.name === MEMBER_OPTION_NAME,
  )?.value;

  const targetDiscordId = memberOptionValue
    ? String(memberOptionValue)
    : interaction.user.id.toString();

  const targetUsername = memberOptionValue
    ? (interaction.data?.resolved?.users?.get(BigInt(targetDiscordId))
        ?.username ?? targetDiscordId)
    : interaction.user.username;

  // Accounts created through the current recruit-application flow already
  // have discord_id set at signup - matching on it is all /profile needs.
  // Accounts created before discord_id existed are linked via /sync (which
  // does the fragile username-based match once, then stores discord_id), so
  // that fallback logic lives there instead of running on every lookup here.
  const account = await User.where("discord_id", targetDiscordId).first();

  if (!account) {
    const isSelf = !memberOptionValue ||
      targetDiscordId === interaction.user.id.toString();

    // The register link (with discord_id/discord pre-filled) is only ever
    // shown to the account owner - never surfaced when checking someone
    // else's profile, so no one else's registration status/link leaks to a
    // third party.
    let content: string;
    if (isSelf) {
      const url = new URL(env("PECU_WEB") as string);
      url.search = new URLSearchParams({
        discord_id: targetDiscordId,
        discord: targetUsername,
      }).toString();
      url.hash = "join";
      content =
        `Your Discord isn't linked yet. If you already registered, run \`/sync\` to link it - otherwise register here: ${url}`;
    } else {
      content = `<@${targetDiscordId}> hasn't registered on the website yet.`;
    }

    await interaction.respond(
      { content },
      { isPrivate: true },
    );
    return;
  }

  // @ts-ignore //
  const accountId = account.id as number;
  // @ts-ignore //
  const accountName = account.name as string | null;

  const characters = await Character.query()
    .select(
      "characters.ign",
      "characters.main",
      "characters.duration",
      DB.raw("nstg_level.code as nstg"),
      DB.raw("third_classes.name as class"),
    )
    .join("nstg_level", "characters.nstg_level_id", "=", "nstg_level.id")
    .join("third_classes", "characters.third_class_id", "=", "third_classes.id")
    .where("characters.user_id", accountId)
    .orderBy("characters.main", "desc")
    .orderBy("nstg_level.id", "desc")
    .get();

  const characterLines = characters.length
    ? characters.map((character) => {
        // @ts-ignore //
        const ign = character.ign as string;
        // @ts-ignore //
        const main = Boolean(character.main);
        // @ts-ignore //
        const className = character.class as string;
        // @ts-ignore //
        const nstg = character.nstg as string;
        // @ts-ignore //
        const duration = character.duration as number | null;

        const durationText = formatDuration(duration);
        return `${main ? "⭐" : "•"} **${ign}** — ${className} (NSTG ${nstg})${
          durationText ? ` — ${durationText}` : ""
        }`;
      })
    : ["No characters registered yet."];

  await interaction.respond({
    embeds: [
      {
        title: `${accountName ?? targetUsername}'s Profile`,
        description: `<@${targetDiscordId}>\n\n${characterLines.join("\n")}`,
        color: PROFILE_COLOR,
      },
    ],
  });
};

export default {
  data: {
    name: "profile",
    description: "Show a member's registered characters.",
    options: [
      {
        name: MEMBER_OPTION_NAME,
        description: "Whose profile to show (defaults to you).",
        type: ApplicationCommandOptionTypes.User,
        required: false,
      },
    ],
  },
  execute,
} satisfies Command;
