import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("user_characters", (table: Blueprint) => {
      table.id();
      table.foreignId("user_id").constrained("users");
      table.foreignId("third_class_id").constrained("third_classes");
      table.foreignId("nstg_level_id").constrained("nstg_level");
      table.string("ign").nullable();
      table.integer("duration").default(0);
      table.boolean("main").default(false);
      table.timestamps();
    }
    );
  }

  public async down() {
    await Schema.dropIfExists("user_characters");
  }
})();
