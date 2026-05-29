import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("characters", (table: Blueprint) => {
        table.id();
        table.integer("user_id").unsigned();
        table.boolean("main").default(false);
        table.integer("third_class_id").unsigned();
        table.integer("nstg_level_id").unsigned();
        table.string("ign", 10);
        table.integer("duration").nullable();
        table.timestamps();
      }
    );
  }

  public async down() {
    await Schema.dropIfExists("characters");
  }
})();
