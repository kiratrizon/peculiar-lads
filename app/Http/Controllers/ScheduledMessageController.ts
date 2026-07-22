import { Carbon } from "helpers";
import Controller from "App/Http/Controllers/Controller.ts";
import DiscordChannel from "App/Models/DiscordChannel.ts";
import ScheduledMessage from "App/Models/ScheduledMessage.ts";
import { discordRest } from "pecu-discord-deno/rest.ts";
import {
  computeNextMonthlyRun,
  computeNextWeeklyRun,
  computeSingleRun,
  formatManilaDisplay,
  parseAppStoredDatetime,
  parseTimeOfDay,
} from "pecu-discord-deno/scheduling.ts";

// deno-lint-ignore no-explicit-any
const presentSchedule = (schedule: any) => ({
  id: schedule.id,
  content: schedule.content,
  recurrence_type: schedule.recurrence_type,
  scheduled_date: schedule.scheduled_date,
  scheduled_time: schedule.scheduled_time,
  day_of_week: schedule.day_of_week,
  day_of_month: schedule.day_of_month,
  is_active: Boolean(schedule.is_active),
  next_run_display: formatManilaDisplay(
    parseAppStoredDatetime(schedule.next_run_at),
  ),
});

const resolveChannel = async (channelId: string) => {
  const channel = await DiscordChannel.where("channel_id", channelId).first();
  if (!channel) {
    abort(404, "Discord channel not found. Try syncing channels again.");
  }
  return channel;
};

const fetchRoles = async (guildId: string) => {
  const roles = await discordRest.getRoles(guildId);
  return roles
    .filter((role) => role.name !== "@everyone")
    .map((role) => ({ id: String(role.id), name: role.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Returns a Carbon instance rather than a plain string - Carbon extends
// String, so the ORM stringifies it (in its own "yyyy-MM-dd HH:mm:ss"
// format, matching this column's shape) automatically when building the
// query, no manual conversion needed.
const computeNextRunAt = (input: Record<string, unknown>) => {
  const time = parseTimeOfDay(String(input.scheduled_time));

  if (input.recurrence_type === "single") {
    return computeSingleRun(String(input.scheduled_date), time);
  }
  if (input.recurrence_type === "weekly") {
    return computeNextWeeklyRun(Carbon.now(), Number(input.day_of_week), time);
  }
  return computeNextMonthlyRun(
    Carbon.now(),
    Number(input.day_of_month),
    time,
  );
};

class ScheduledMessageController extends Controller {
  public index: HttpDispatch = async ({ request }, { discord_channel_id }) => {
    const channel = await resolveChannel(discord_channel_id as string);

    // @ts-ignore //
    const channelRowId = channel.id as number;
    // @ts-ignore //
    const guildId = channel.guild_id as string;

    const schedules = await ScheduledMessage.where(
      "discord_channel_id",
      channelRowId,
    )
      .orderBy("next_run_at", "asc")
      .get();

    const roles = await fetchRoles(guildId);

    return view("admin.schedule.message", {
      selected: "schedule",
      entity: "Admin",
      title: "Schedule a Message",
      channel,
      schedules: schedules.map(presentSchedule),
      roles,
      editing: null,
    });
  };

  public store: HttpDispatch = async ({ request }, { discord_channel_id }) => {
    const channel = await resolveChannel(discord_channel_id as string);
    // @ts-ignore //
    const channelRowId = channel.id as number;

    const data = await request.validate({
      content: "required",
      recurrence_type: "required|in:single,weekly,monthly",
      scheduled_time: "required",
      scheduled_date: "required_if:recurrence_type,single",
      day_of_week: "required_if:recurrence_type,weekly",
      day_of_month: "required_if:recurrence_type,monthly",
    });

    const next_run_at = computeNextRunAt(data);

    await ScheduledMessage.create({
      discord_channel_id: channelRowId,
      content: data.content,
      recurrence_type: data.recurrence_type,
      scheduled_date: data.scheduled_date ?? null,
      scheduled_time: data.scheduled_time,
      day_of_week: data.day_of_week ? Number(data.day_of_week) : null,
      day_of_month: data.day_of_month ? Number(data.day_of_month) : null,
      next_run_at,
      last_sent_at: null,
      is_active: true,
    });

    return redirect()
      .route("admin.schedule.message", { discord_channel_id })
      .with("message", "Message scheduled.");
  };

  public edit: HttpDispatch = async (
    { request },
    { discord_channel_id, scheduledMessage },
  ) => {
    const channel = await resolveChannel(discord_channel_id as string);
    // @ts-ignore //
    const channelRowId = channel.id as number;
    // @ts-ignore //
    const guildId = channel.guild_id as string;

    const editing = await ScheduledMessage.where("id", scheduledMessage)
      .where("discord_channel_id", channelRowId)
      .first();

    if (!editing) {
      abort(404, "Scheduled message not found.");
    }

    const schedules = await ScheduledMessage.where(
      "discord_channel_id",
      channelRowId,
    )
      .orderBy("next_run_at", "asc")
      .get();

    const roles = await fetchRoles(guildId);

    return view("admin.schedule.message", {
      selected: "schedule",
      entity: "Admin",
      title: "Schedule a Message",
      channel,
      schedules: schedules.map(presentSchedule),
      roles,
      editing: presentSchedule(editing),
    });
  };

  public update: HttpDispatch = async (
    { request },
    { discord_channel_id, scheduledMessage },
  ) => {
    const channel = await resolveChannel(discord_channel_id as string);
    // @ts-ignore //
    const channelRowId = channel.id as number;

    const editing = await ScheduledMessage.where("id", scheduledMessage)
      .where("discord_channel_id", channelRowId)
      .first();

    if (!editing) {
      abort(404, "Scheduled message not found.");
    }

    const data = await request.validate({
      content: "required",
      recurrence_type: "required|in:single,weekly,monthly",
      scheduled_time: "required",
      scheduled_date: "required_if:recurrence_type,single",
      day_of_week: "required_if:recurrence_type,weekly",
      day_of_month: "required_if:recurrence_type,monthly",
    });

    const next_run_at = computeNextRunAt(data);

    editing.fill({
      content: data.content,
      recurrence_type: data.recurrence_type,
      scheduled_date: data.scheduled_date ?? null,
      scheduled_time: data.scheduled_time,
      day_of_week: data.day_of_week ? Number(data.day_of_week) : null,
      day_of_month: data.day_of_month ? Number(data.day_of_month) : null,
      next_run_at,
      is_active: request.input("is_active") ? true : false,
    });
    await editing.save();

    return redirect()
      .route("admin.schedule.message", { discord_channel_id })
      .with("message", "Scheduled message updated.");
  };

  public destroy: HttpDispatch = async (
    { request },
    { discord_channel_id, scheduledMessage },
  ) => {
    const channel = await resolveChannel(discord_channel_id as string);
    // @ts-ignore //
    const channelRowId = channel.id as number;

    await ScheduledMessage.query()
      .where("id", scheduledMessage)
      .where("discord_channel_id", channelRowId)
      .delete();

    return redirect()
      .route("admin.schedule.message", { discord_channel_id })
      .with("message", "Scheduled message deleted.");
  };
}

export default ScheduledMessageController;
