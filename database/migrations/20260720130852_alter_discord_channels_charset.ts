import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("discord_channels", (table: Blueprint) => {
      table.alterMode();
      table.charset = "utf8mb4";
      table.collation = "utf8mb4_unicode_ci";
    });
  }

  public async down() {
    await Schema.table("discord_channels", (table: Blueprint) => {
      table.alterMode();
      table.charset = "utf8";
      table.collation = "utf8_general_ci";
    });
  }
})();
