import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("discord_details", (table: Blueprint) => {
      table.id();
      table.string("discord_link").notNullable();
      table.timestamps();
    });
  }

  public async down() {
    await Schema.dropIfExists("discord_details");
  }
})();
