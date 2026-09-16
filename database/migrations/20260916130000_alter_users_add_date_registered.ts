import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("users", (table: Blueprint) => {
      table.alterMode();
      // Stamped every time an application is submitted, including a returnee
      // re-applying on a restored row - created_at can't serve, since a
      // returnee's row dates back to their first stint and would hand them an
      // already-unlocked Code of Ethics button.
      table.timestamp("date_registered").nullable();
    });
  }

  public async down() {
    await Schema.table("users", (table: Blueprint) => {
      table.alterMode();
      table.dropColumn("date_registered");
    });
  }
})();
