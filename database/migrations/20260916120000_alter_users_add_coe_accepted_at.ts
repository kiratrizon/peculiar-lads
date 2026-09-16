import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("users", (table: Blueprint) => {
      table.alterMode();
      // Null until the recruit taps "I have read this" on /pecu-coe. Doubles as
      // the guard that keeps the welcome banner from being posted twice.
      table.timestamp("coe_accepted_at").nullable();
    });
  }

  public async down() {
    await Schema.table("users", (table: Blueprint) => {
      table.alterMode();
      table.dropColumn("coe_accepted_at");
    });
  }
})();
