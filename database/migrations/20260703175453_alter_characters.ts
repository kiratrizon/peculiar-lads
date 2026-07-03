import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("characters", (table: Blueprint) => {
      // alter logic
      table.string("ign", 10).unique().notNullable().change();
    });
  }

  public async down() {
    await Schema.table("characters", (table: Blueprint) => {
      // reverse alter logic
      table.string("ign", 10).change();
    });
  }
})();
