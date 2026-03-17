import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("event_reads", (table: Blueprint) => {
      // alter logic
      table.integer("admin_user_id").notNullable();
    });
  }

  public async down() {
    await Schema.table("event_reads", (table: Blueprint) => {
      // reverse alter logic
      table.dropColumn("admin_user_id");
    });
  }
})();
