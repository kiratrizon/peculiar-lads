import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("nstg_level", (table: Blueprint) => {
      table.id();
      table.string("code").notNullable();
      table.string("name").notNullable();
      table.timestamps();
    });
  }

  public async down() {
    await Schema.dropIfExists("nstg_level");
  }
})();
