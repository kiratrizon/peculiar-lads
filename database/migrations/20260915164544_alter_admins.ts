import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("admins", (table: Blueprint) => {
      // alter logic
      table.string("api_token").nullable().after("password");
    });
  }

  public async down() {
    await Schema.table("admins", (table: Blueprint) => {
      // reverse alter logic
      table.dropColumn("api_token");
    });
  }
})();
