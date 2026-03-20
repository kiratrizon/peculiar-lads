import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("recruits", (table: Blueprint) => {
      table.id();
      table.integer("nstg").notNullable();
      table.integer("class").notNullable();
      table.string("ign").notNullable();
      table.string("discord").notNullable();
      table.text("reason").notNullable();
      table.integer("status").notNullable().default(0).comment("0: pending, 1: invited, 2: rejected, 3: accepted");
      table.timestamps();
    }
    );
  }

  public async down() {
    await Schema.dropIfExists("recruits");
  }
})();
