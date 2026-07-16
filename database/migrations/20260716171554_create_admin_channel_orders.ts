import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("admin_channel_orders", (table: Blueprint) => {
      table.id();
      table.foreignId("admin_id").constrained().onDelete("cascade");
      table.foreignId("discord_channel_id").constrained().onDelete("cascade");
      table.integer("position").default(0);
      table.timestamps();
    });
  }

  public async down() {
    await Schema.dropIfExists("admin_channel_orders");
  }
})();
