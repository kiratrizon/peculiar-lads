import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("users", (table: Blueprint) => {
      table.charset = "utf8mb4";
      table.collation = "utf8mb4_unicode_ci";
    });
  }

  public async down() {
    // Reverting re-truncates any emoji already stored, so this is lossy.
    await Schema.table("users", (table: Blueprint) => {
      table.charset = "utf8mb3";
      table.collation = "utf8mb3_general_ci";
    });
  }
})();
