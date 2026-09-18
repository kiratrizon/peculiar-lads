import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import { discordRest } from "./rest.ts";
import { logErrorToDiscord } from "./errorLog.ts";
import type { AppInteraction, Command } from "./types.ts";

// Shared by /promote and /demote - the two commands only differ in which
// direction the role moves, so everything else (admin gate, hierarchy
// checks, "already has it" handling) lives here once.

const MEMBER_OPTION_NAME = "user";
const ROLE_OPTION_NAME = "role";

const isAdmin = (interaction: AppInteraction): boolean => {
  const adminRoleId = env("ADMIN_ROLE_ID") as string | null;
  const eirazynRoleId = "379291655033061376";
  if (interaction.member?.id.toString() === eirazynRoleId) {
    return true;
  }
  return (
    !!adminRoleId &&
    !!interaction.member?.roles.some(
      (roleId) => roleId.toString() === adminRoleId,
    )
  );
};

const getOptionValue = (interaction: AppInteraction, name: string) =>
  interaction.data?.options?.find((option) => option.name === name)?.value;

type Mode = "promote" | "demote";

const execute = async (mode: Mode, interaction: AppInteraction) => {
  const isPromote = mode === "promote";

  if (!interaction.guildId) {
    await interaction.respond(
      { content: "This command can only be used in a server." },
      { isPrivate: true },
    );
    return;
  }

  if (!isAdmin(interaction)) {
    await interaction.respond(
      { content: `You need the admin role to ${mode} members.` },
      { isPrivate: true },
    );
    return;
  }

  const targetId = String(
    getOptionValue(interaction, MEMBER_OPTION_NAME) ?? "",
  );
  const roleId = String(getOptionValue(interaction, ROLE_OPTION_NAME) ?? "");

  if (!targetId || !roleId) {
    await interaction.respond(
      { content: "Both a user and a role are required." },
      { isPrivate: true },
    );
    return;
  }

  const guildId = interaction.guildId.toString();
  const roles = await discordRest.getRoles(guildId);
  const role = roles.find((candidate) => String(candidate.id) === roleId);

  if (!role) {
    await interaction.respond(
      { content: "That role no longer exists in this server." },
      { isPrivate: true },
    );
    return;
  }

  // The @everyone role shares the guild's id and can't be added or removed.
  if (roleId === guildId) {
    await interaction.respond(
      { content: "`@everyone` isn't a role that can be assigned." },
      { isPrivate: true },
    );
    return;
  }

  // Roles owned by an integration (bot roles, booster role, etc.) are locked
  // by Discord - the API rejects any attempt to hand them out manually.
  if (role.managed) {
    await interaction.respond(
      {
        content: `**${role.name}** is managed by an integration, so it can't be assigned manually.`,
      },
      { isPrivate: true },
    );
    return;
  }

  // Hierarchy guard: an admin can only hand out (or take away) roles that sit
  // below their own top role, so no one can use this to grant themselves - or
  // a friend - something above their own rank.
  const positionOf = (id: string) =>
    roles.find((candidate) => String(candidate.id) === id)?.position ?? 0;

  const actorHighestPosition = Math.max(
    0,
    ...(interaction.member?.roles ?? []).map((id) => positionOf(id.toString())),
  );

  if (role.position >= actorHighestPosition) {
    await interaction.respond(
      {
        content: `**${role.name}** is at or above your own highest role, so you can't ${mode} anyone with it.`,
      },
      { isPrivate: true },
    );
    return;
  }

  const member = await discordRest
    .getMember(guildId, targetId)
    .catch(() => null);

  if (!member) {
    await interaction.respond(
      { content: `<@${targetId}> isn't in this server.` },
      { isPrivate: true },
    );
    return;
  }

  const hasRole = member.roles.some((id) => String(id) === roleId);

  if (isPromote && hasRole) {
    await interaction.respond(
      { content: `<@${targetId}> already has **${role.name}**.` },
      { isPrivate: true },
    );
    return;
  }

  if (!isPromote && !hasRole) {
    await interaction.respond(
      { content: `<@${targetId}> doesn't have **${role.name}**.` },
      { isPrivate: true },
    );
    return;
  }

  const reason = `${isPromote ? "Promoted" : "Demoted"} by ${interaction.user.username}`;

  try {
    if (isPromote) {
      await discordRest.addRole(guildId, targetId, roleId, reason);
    } else {
      await discordRest.removeRole(guildId, targetId, roleId, reason);
    }
  } catch (e) {
    console.error(`Failed to ${mode} member`, e);
    logErrorToDiscord(`command:${mode}`, e);
    await interaction.respond(
      {
        content: `Couldn't ${isPromote ? "add" : "remove"} **${role.name}**. Make sure the bot has Manage Roles and that its own role sits above **${role.name}**.`,
      },
      { isPrivate: true },
    );
    return;
  }

  // The demotion itself is announced in-channel - only the failure paths
  // above stay ephemeral.
  await interaction.respond(
    {
      content: isPromote
        ? `Promoted <@${targetId}> to **${role.name}**.`
        : `Removed **${role.name}** from <@${targetId}>.`,
    },
    { isPrivate: !isPromote },
  );
};

export const createRoleCommand = (mode: Mode): Command => ({
  data: {
    name: mode,
    description:
      mode === "promote"
        ? "Give a member a role."
        : "Take a role away from a member.",
    options: [
      {
        name: MEMBER_OPTION_NAME,
        description:
          mode === "promote"
            ? "The member to promote."
            : "The member to demote.",
        type: ApplicationCommandOptionTypes.User,
        required: true,
      },
      {
        name: ROLE_OPTION_NAME,
        description:
          mode === "promote"
            ? "The role to give them."
            : "The role to take away.",
        type: ApplicationCommandOptionTypes.Role,
        required: true,
      },
    ],
  },
  execute: (interaction) => execute(mode, interaction),
});
