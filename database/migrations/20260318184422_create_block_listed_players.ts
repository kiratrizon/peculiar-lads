import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("block_listed_players", (table: Blueprint) => {
      table.id();
      table.string("ign").notNullable();
      table.integer("first_class_id").nullable();
      table.json("social_links").nullable();
      table.string("reason").nullable();
      table.timestamps();
    }
    );
  }

  public async down() {
    await Schema.dropIfExists("block_listed_players");
  }
})();
