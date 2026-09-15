import Controller from "App/Http/Controllers/Controller.ts";
import { Carbon } from "helpers";

import ScheduledMessage, {
  ScheduledMessageSchema,
} from "App/Models/ScheduledMessage.ts";
import DiscordChannel from "App/Models/DiscordChannel.ts";

import {
  extractRoleMentionIds,
  renderMentions,
  splitMessage,
} from "pecu-discord-deno/mentions.ts";
import { discordRest } from "pecu-discord-deno/rest.ts";

const arrangeByOnlyDate = (now: Carbon): string => {
  return now.toString().split(" ")[0];
};

type SMResult = ScheduledMessage & ScheduledMessageSchema;

class KeepAliveController extends Controller {
  public index: HttpDispatch = async ({ request }) => {
    const now = Carbon.now();
    const nowPlusWeek = now.addWeeks(1);

    const nowPlusMonthBase = now.addMonths(1);

    const nowOnlyDate = arrangeByOnlyDate(now);
    const weekOnlyDate = arrangeByOnlyDate(nowPlusWeek);

    // @ts-ignore //
    const due = (await ScheduledMessage.where("is_active", true)
      .where("next_run_at", "<=", now)
      .get()) as SMResult[] | null;
    if (!isset(due)) {
      return response().json({ message: "Keep alive!", sent: 0 });
    }

    let sent = 0;

    for (const scheduled of due) {
      const scheduledId = scheduled.id as number;
      const channelRowId = scheduled.discord_channel_id as number;
      const content = scheduled.content as string;
      const recurrenceType = scheduled.recurrence_type as
        | "single"
        | "weekly"
        | "monthly";
      const dayOfMonth = scheduled.day_of_month as number | null;

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

        const allowedRoles = extractRoleMentionIds(content);
        for (const chunk of splitMessage(renderMentions(content))) {
          await discordRest.sendMessage(channelId, {
            content: chunk,
            allowedMentions: { roles: allowedRoles },
          });
        }

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
        sent++;
      } catch (e) {
        console.error(`Failed to send scheduled message ${scheduledId}`, e);
      }
    }

    return response().json({ message: "Keep alive!", sent });
  };
}

export default KeepAliveController;
