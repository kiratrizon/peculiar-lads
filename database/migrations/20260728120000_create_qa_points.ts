import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("qa_points", (table: Blueprint) => {
      table.charset = "utf8mb4";
      table.collation = "utf8mb4_unicode_ci";
      table.id();
      table.string("discord_id").unique().notNullable();
      table.string("username").nullable();
      table.integer("points").default(0);
      table.integer("level").default(1);
      table.timestamps();
    });
  }

  public async down() {
    await Schema.dropIfExists("qa_points");
  }
})();
