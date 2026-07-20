import {
  ApplicationCommandOptionTypes,
  ChannelTypes,
  MessageComponentTypes,
  TextStyles,
} from "@discordeno/bot";
import type { InteractionDataOption } from "@discordeno/bot";
import DiscordChannel from "App/Models/DiscordChannel.ts";
import ScheduledMessage from "App/Models/ScheduledMessage.ts";
import type { AppInteraction, Command } from "../types.ts";
import {
  computeNextMonthlyRun,
  computeNextWeeklyRun,
  computeSingleRun,
  formatManilaDisplay,
  parseAppStoredDatetime,
  parseTimeOfDay,
  toAppStoredDatetime,
} from "../scheduling.ts";

const CHANNEL_OPTION_NAME = "channel";
const ID_OPTION_NAME = "id";

const CONTENT_FIELD = "content";
const RECURRENCE_FIELD = "recurrence_type";
const TIME_FIELD = "scheduled_time";
const DATE_OR_DAY_FIELD = "date_or_day";

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type RecurrenceType = "single" | "weekly" | "monthly";

const isOfficer = (interaction: AppInteraction): boolean => {
  const officerRoleId = env("OFFICER_ROLE_ID") as string | null;
  const adminRoleId = env("ADMIN_ROLE_ID") as string | null;
  return (
    !!officerRoleId &&
    !!interaction.member?.roles.some((roleId) =>
      [officerRoleId, adminRoleId].includes(roleId.toString()),
    )
  );
};

const isAdmin = (interaction: AppInteraction): boolean => {
  const adminRoleId = env("ADMIN_ROLE_ID") as string | null;
  return (
    !!adminRoleId &&
    !!interaction.member?.roles.some(
      (roleId) => roleId.toString() === adminRoleId,
    )
  );
};

const denyNoPermission = (interaction: AppInteraction) =>
  interaction.respond(
    { content: "You need the officer role to manage scheduled messages." },
    { isPrivate: true },
  );

const denyNotAdmin = (interaction: AppInteraction) =>
  interaction.respond(
    { content: "You need the admin role to list scheduled messages." },
    { isPrivate: true },
  );

const getOption = (
  options: InteractionDataOption[] | undefined,
  name: string,
) => options?.find((option) => option.name === name)?.value;

const getModalValue = (
  interaction: AppInteraction,
  customId: string,
): string => {
  for (const row of interaction.data?.components ?? []) {
    const match = row.components?.find(
      (component) => component.customId === customId,
    );
    if (match) return match.value ?? "";
  }
  return "";
};

const computeNextRunAt = (
  recurrenceType: RecurrenceType,
  dateOrDay: string,
  time: ReturnType<typeof parseTimeOfDay>,
): Date => {
  if (recurrenceType === "single") return computeSingleRun(dateOrDay, time);
  if (recurrenceType === "weekly") {
    return computeNextWeeklyRun(new Date(), Number(dateOrDay), time);
  }
  return computeNextMonthlyRun(new Date(), Number(dateOrDay), time);
};

const resolveOrCreateChannel = async (
  interaction: AppInteraction,
  channelId: string,
) => {
  const resolvedChannel = interaction.data?.resolved?.channels?.get(
    BigInt(channelId),
  );
  const guildId = String(interaction.guildId ?? env("DISCORD_GUILD_ID") ?? "");

  const existing = await DiscordChannel.where("channel_id", channelId).first();
  if (existing) return existing;

  return await DiscordChannel.create({
    channel_id: channelId,
    guild_id: guildId,
    name: resolvedChannel?.name ?? channelId,
  });
};

const handleAdd = async (
  interaction: AppInteraction,
  options: InteractionDataOption[] | undefined,
) => {
  const channelId = String(getOption(options, CHANNEL_OPTION_NAME) ?? "");
  if (!channelId) {
    await interaction.respond(
      { content: "A channel is required." },
      { isPrivate: true },
    );
    return;
  }

  const channelRow = await resolveOrCreateChannel(interaction, channelId);
  // @ts-ignore //
  const channelRowId = channelRow.id as number;

  await interaction.respond({
    customId: `schedule:add:${channelRowId}`,
    title: "Schedule a message",
    components: [
      {
        type: MessageComponentTypes.ActionRow,
        components: [
          {
            type: MessageComponentTypes.InputText,
            style: TextStyles.Paragraph,
            customId: CONTENT_FIELD,
            label: "Message content",
            required: true,
            maxLength: 1900,
          },
        ],
      },
      {
        type: MessageComponentTypes.ActionRow,
        components: [
          {
            type: MessageComponentTypes.InputText,
            style: TextStyles.Short,
            customId: RECURRENCE_FIELD,
            label: "Recurrence: single, weekly, or monthly",
            required: true,
          },
        ],
      },
      {
        type: MessageComponentTypes.ActionRow,
        components: [
          {
            type: MessageComponentTypes.InputText,
            style: TextStyles.Short,
            customId: TIME_FIELD,
            label: "Time, 24h Manila time (HH:MM)",
            placeholder: "19:00",
            required: true,
          },
        ],
      },
      {
        type: MessageComponentTypes.ActionRow,
        components: [
          {
            type: MessageComponentTypes.InputText,
            style: TextStyles.Short,
            customId: DATE_OR_DAY_FIELD,
            label: "Date (single) / day 0-6 wk / 1-31 mo",
            placeholder: "2026-08-01, or 1, or 15",
            required: true,
          },
        ],
      },
    ],
  });
};

const handleModalSubmit = async (interaction: AppInteraction) => {
  if (!isOfficer(interaction)) {
    await denyNoPermission(interaction);
    return;
  }

  const customId = interaction.data?.customId ?? "";
  const [, action, channelRowIdStr] = customId.split(":");
  if (action !== "add") return;

  const channelRowId = Number(channelRowIdStr);
  const content = getModalValue(interaction, CONTENT_FIELD).trim();
  const recurrenceType = getModalValue(interaction, RECURRENCE_FIELD)
    .trim()
    .toLowerCase() as RecurrenceType;
  const scheduledTime = getModalValue(interaction, TIME_FIELD).trim();
  const dateOrDay = getModalValue(interaction, DATE_OR_DAY_FIELD).trim();

  if (!["single", "weekly", "monthly"].includes(recurrenceType)) {
    await interaction.respond(
      { content: "Recurrence must be single, weekly, or monthly." },
      { isPrivate: true },
    );
    return;
  }

  if (!TIME_PATTERN.test(scheduledTime)) {
    await interaction.respond(
      { content: "Time must look like HH:MM, e.g. 19:00." },
      { isPrivate: true },
    );
    return;
  }

  if (recurrenceType === "single" && !DATE_PATTERN.test(dateOrDay)) {
    await interaction.respond(
      { content: "Date must look like YYYY-MM-DD for a single message." },
      { isPrivate: true },
    );
    return;
  }

  if (recurrenceType === "weekly") {
    const dayOfWeek = Number(dateOrDay);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      await interaction.respond(
        {
          content: "Day must be 0 (Sun) through 6 (Sat) for a weekly message.",
        },
        { isPrivate: true },
      );
      return;
    }
  }

  if (recurrenceType === "monthly") {
    const dayOfMonth = Number(dateOrDay);
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      await interaction.respond(
        { content: "Day must be 1 through 31 for a monthly message." },
        { isPrivate: true },
      );
      return;
    }
  }

  const time = parseTimeOfDay(scheduledTime);
  const nextRunAt = computeNextRunAt(recurrenceType, dateOrDay, time);

  await ScheduledMessage.create({
    discord_channel_id: channelRowId,
    content,
    recurrence_type: recurrenceType,
    scheduled_date: recurrenceType === "single" ? dateOrDay : null,
    scheduled_time: scheduledTime,
    day_of_week: recurrenceType === "weekly" ? Number(dateOrDay) : null,
    day_of_month: recurrenceType === "monthly" ? Number(dateOrDay) : null,
    next_run_at: toAppStoredDatetime(nextRunAt),
    last_sent_at: null,
    is_active: true,
  });

  await interaction.respond(
    { content: `Scheduled. Next run: ${formatManilaDisplay(nextRunAt)}` },
    { isPrivate: true },
  );
};

const MAX_LISTED = 15;

const handleList = async (
  interaction: AppInteraction,
  options: InteractionDataOption[] | undefined,
) => {
  const channelId = getOption(options, CHANNEL_OPTION_NAME);

  let query = ScheduledMessage.where("is_active", true);
  if (channelId) {
    const channelRow = await DiscordChannel.where(
      "channel_id",
      String(channelId),
    ).first();
    if (!channelRow) {
      await interaction.respond(
        { content: "That channel has no scheduled messages." },
        { isPrivate: true },
      );
      return;
    }
    // @ts-ignore //
    query = query.where("discord_channel_id", channelRow.id as number);
  }

  const schedules = await query.orderBy("next_run_at", "asc").get();

  if (schedules.length === 0) {
    await interaction.respond(
      { content: "No active scheduled messages." },
      { isPrivate: true },
    );
    return;
  }

  const channelRows = await DiscordChannel.all();
  // @ts-ignore //
  const channelNameById = new Map(
    // @ts-ignore //
    channelRows.map((row) => [row.id as number, row.channel_id as string]),
  );

  const lines = schedules.slice(0, MAX_LISTED).map((schedule) => {
    // @ts-ignore //
    const id = schedule.id as number;
    // @ts-ignore //
    const content = schedule.content as string;
    // @ts-ignore //
    const recurrenceType = schedule.recurrence_type as RecurrenceType;
    // @ts-ignore //
    const discordChannelId = schedule.discord_channel_id as number;
    // @ts-ignore //
    const nextRunAt = schedule.next_run_at as string;

    const channelId = channelNameById.get(discordChannelId);
    const preview =
      content.length > 60 ? `${content.slice(0, 60)}...` : content;
    const nextRunDisplay = formatManilaDisplay(
      parseAppStoredDatetime(nextRunAt),
    );

    return `**#${id}** ${channelId ? `<#${channelId}>` : "unknown channel"} — "${preview}" (${recurrenceType}) next: ${nextRunDisplay}`;
  });

  const truncatedNotice =
    schedules.length > MAX_LISTED
      ? `\n...and ${schedules.length - MAX_LISTED} more.`
      : "";

  await interaction.respond(
    { content: lines.join("\n") + truncatedNotice },
    { isPrivate: true },
  );
};

const handleRemove = async (
  interaction: AppInteraction,
  options: InteractionDataOption[] | undefined,
) => {
  const id = Number(getOption(options, ID_OPTION_NAME));

  const existing = await ScheduledMessage.where("id", id).first();
  if (!existing) {
    await interaction.respond(
      { content: `No scheduled message with id ${id}.` },
      { isPrivate: true },
    );
    return;
  }

  await ScheduledMessage.query().where("id", id).delete();

  await interaction.respond(
    { content: `Removed scheduled message #${id}.` },
    { isPrivate: true },
  );
};

const execute = async (interaction: AppInteraction) => {
  if (!isOfficer(interaction)) {
    await denyNoPermission(interaction);
    return;
  }

  const subcommand = interaction.data?.options?.[0];
  switch (subcommand?.name) {
    case "add":
      await handleAdd(interaction, subcommand.options);
      break;
    case "list":
      if (!isAdmin(interaction)) {
        await denyNotAdmin(interaction);
        break;
      }
      await handleList(interaction, subcommand.options);
      break;
    case "remove":
      await handleRemove(interaction, subcommand.options);
      break;
  }
};

export default {
  data: {
    name: "schedule",
    description: "Manage scheduled messages. Officers only.",
    options: [
      {
        name: "add",
        description: "Schedule a new message in a channel.",
        type: ApplicationCommandOptionTypes.SubCommand,
        options: [
          {
            name: CHANNEL_OPTION_NAME,
            description: "The channel to send the message in.",
            type: ApplicationCommandOptionTypes.Channel,
            channelTypes: [
              ChannelTypes.GuildText,
              ChannelTypes.GuildAnnouncement,
            ],
            required: true,
          },
        ],
      },
      {
        name: "list",
        description: "List active scheduled messages. Admins only.",
        type: ApplicationCommandOptionTypes.SubCommand,
        options: [
          {
            name: CHANNEL_OPTION_NAME,
            description: "Only show messages scheduled in this channel.",
            type: ApplicationCommandOptionTypes.Channel,
            channelTypes: [
              ChannelTypes.GuildText,
              ChannelTypes.GuildAnnouncement,
            ],
            required: false,
          },
        ],
      },
      {
        name: "remove",
        description: "Remove a scheduled message by id.",
        type: ApplicationCommandOptionTypes.SubCommand,
        options: [
          {
            name: ID_OPTION_NAME,
            description: "The id shown by /schedule list.",
            type: ApplicationCommandOptionTypes.Integer,
            required: true,
          },
        ],
      },
    ],
  },
  execute,
  handleModal: handleModalSubmit,
} satisfies Command;
