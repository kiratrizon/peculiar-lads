import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("scheduled_messages", (table: Blueprint) => {
      table.id();
      table.foreignId("discord_channel_id").constrained().onDelete("cascade");
      table.text("content").notNullable();
      table
        .enum("recurrence_type", ["single", "weekly", "monthly"])
        .notNullable();
      table.date("scheduled_date").nullable();
      table.time("scheduled_time").notNullable();
      table.tinyInteger("day_of_week").nullable();
      table.tinyInteger("day_of_month").nullable();
      table.dateTime("next_run_at").notNullable();
      table.dateTime("last_sent_at").nullable();
      table.boolean("is_active").default(true);
      table.timestamps();
    });
  }

  public async down() {
    await Schema.dropIfExists("scheduled_messages");
  }
})();
