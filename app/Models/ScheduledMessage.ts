import Model from "Illuminate/Database/Eloquent/Model.ts";

export type RecurrenceType = "single" | "weekly" | "monthly";

export type ScheduledMessageSchema = {
  id?: number;
  discord_channel_id: number;
  content: string;
  recurrence_type: RecurrenceType;
  scheduled_date: string | null;
  scheduled_time: string;
  day_of_week: number | null;
  day_of_month: number | null;
  next_run_at: string;
  last_sent_at: string | null;
  is_active: boolean;
};

class ScheduledMessage extends Model<ScheduledMessageSchema> {
  protected static override _fillable = [
    "discord_channel_id",
    "content",
    "recurrence_type",
    "scheduled_date",
    "scheduled_time",
    "day_of_week",
    "day_of_month",
    "next_run_at",
    "last_sent_at",
    "is_active",
  ];
}

export default ScheduledMessage;
