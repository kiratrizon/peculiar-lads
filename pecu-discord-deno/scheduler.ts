import DiscordChannel from "App/Models/DiscordChannel.ts";
import ScheduledMessage from "App/Models/ScheduledMessage.ts";
import type { AppBot } from "./types.ts";
import { extractRoleMentionIds, renderMentions } from "./mentions.ts";
import {
  computeNextMonthlyRun,
  computeNextWeeklyRun,
  parseTimeOfDay,
  toAppStoredDatetime as toDbDatetime,
} from "./scheduling.ts";

// Registers a Deno.cron job rather than a plain `setInterval`: on Deno
// Deploy, `Deno.cron` is deduplicated across regions/instances so exactly
// one instance runs each tick, even though this same bot process gets
// booted per-region via routes/console.ts (see the leader-lock discussion
// earlier) - a setInterval poller here would send every scheduled message
// once per active region.
export const startScheduledMessagesCron = (bot: AppBot) => {
  Deno.cron("scheduled-messages", "* * * * *", async () => {
    const now = new Date();

    const due = await ScheduledMessage.where("is_active", true)
      .where("next_run_at", "<=", toDbDatetime(now))
      .get();

    for (const scheduled of due) {
      // @ts-ignore //
      const scheduledId = scheduled.id as number;
      // @ts-ignore //
      const channelRowId = scheduled.discord_channel_id as number;
      // @ts-ignore //
      const content = scheduled.content as string;
      // @ts-ignore //
      const recurrenceType = scheduled.recurrence_type as
        | "single"
        | "weekly"
        | "monthly";
      // @ts-ignore //
      const scheduledTime = scheduled.scheduled_time as string;
      // @ts-ignore //
      const dayOfWeek = scheduled.day_of_week as number | null;
      // @ts-ignore //
      const dayOfMonth = scheduled.day_of_month as number | null;

      try {
        const channel = await DiscordChannel.where("id", channelRowId).first();

        if (!channel) {
          console.error(
            `Scheduled message ${scheduledId} references missing channel ${channelRowId}`,
          );
          continue;
        }

        // @ts-ignore //
        const channelId = channel.channel_id as string;

        await bot.helpers.sendMessage(channelId, {
          content: renderMentions(content),
          allowedMentions: { roles: extractRoleMentionIds(content) },
        });

        const time = parseTimeOfDay(scheduledTime);
        const updates: Record<string, unknown> = {
          last_sent_at: toDbDatetime(now),
        };

        if (recurrenceType === "single") {
          updates.is_active = false;
        } else if (recurrenceType === "weekly") {
          updates.next_run_at = toDbDatetime(
            computeNextWeeklyRun(now, dayOfWeek ?? 0, time),
          );
        } else {
          updates.next_run_at = toDbDatetime(
            computeNextMonthlyRun(now, dayOfMonth ?? 1, time),
          );
        }

        scheduled.fill(updates);
        await scheduled.save();
      } catch (e) {
        console.error(`Failed to send scheduled message ${scheduledId}`, e);
      }
    }
  });
};
