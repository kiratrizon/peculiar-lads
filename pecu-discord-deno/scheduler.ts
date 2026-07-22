import { Carbon } from "helpers";
import DiscordChannel from "App/Models/DiscordChannel.ts";
import ScheduledMessage from "App/Models/ScheduledMessage.ts";
import type { AppBot } from "./types.ts";
import { extractRoleMentionIds, renderMentions } from "./mentions.ts";

const arrangeByOnlyDate = (now: Carbon): string => {
  return now.toString().split(" ")[0];
};

export const startScheduledMessagesCron = (bot: AppBot) => {
  Deno.cron("scheduled-messages", "* * * * *", async () => {
    const now = Carbon.now();
    const nowPlusWeek = now.addWeeks(1);

    const nowPlusMonthBase = now.addMonths(1);

    const nowOnlyDate = arrangeByOnlyDate(now);
    const weekOnlyDate = arrangeByOnlyDate(nowPlusWeek);

    const due = await ScheduledMessage.where("is_active", true)
      .where("next_run_at", "<=", now)
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
      const dayOfMonth = scheduled.day_of_month as number | null;

      // @ts-ignore //
      const scheduledTime = scheduled.scheduled_time as string;

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

        const updates: Record<string, unknown> = {
          last_sent_at: `${nowOnlyDate} ${scheduledTime}`,
        };

        if (recurrenceType === "single") {
          updates.is_active = false;
        } else if (recurrenceType === "weekly") {
          updates.next_run_at = `${weekOnlyDate} ${scheduledTime}`;
        } else {
          // if selected day not in the month
          const clampedDay = Math.min(
            dayOfMonth ?? 1,
            nowPlusMonthBase.daysInMonth(),
          );
          const datePart = `${nowPlusMonthBase.year()}-${String(
            nowPlusMonthBase.month(),
          ).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
          updates.next_run_at = `${datePart} ${scheduledTime}`;
        }

        scheduled.fill(updates);
        await scheduled.save();
      } catch (e) {
        console.error(`Failed to send scheduled message ${scheduledId}`, e);
      }
    }
  });
};
