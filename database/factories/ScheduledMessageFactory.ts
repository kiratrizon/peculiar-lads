import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import ScheduledMessage from "App/Models/ScheduledMessage.ts";

export default class ScheduledMessageFactory extends Factory {
  protected override _model = ScheduledMessage;

  public definition() {
    return {
      discord_channel_id: 1,
      content: "Scheduled message",
      recurrence_type: "single",
      scheduled_date: new Date().toISOString().slice(0, 10),
      scheduled_time: "09:00:00",
      day_of_week: null,
      day_of_month: null,
      next_run_at: new Date(),
      last_sent_at: null,
      is_active: true,
    };
  }
}
