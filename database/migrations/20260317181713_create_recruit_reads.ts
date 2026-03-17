import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("recruit_reads", (table: Blueprint) => {
      table.id();
      table.integer("recruit_id").notNullable();
      table.integer("admin_id").notNullable();
      table.boolean("read").notNullable().default(false).comment("0: not read, 1: read");
      table.timestamps();
    }
    );
  }

  public async down() {
    await Schema.dropIfExists("recruit_reads");
  }
})();
