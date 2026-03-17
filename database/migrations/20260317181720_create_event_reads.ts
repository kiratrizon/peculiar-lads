import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("event_reads", (table: Blueprint) => {
      table.id();
      table.integer("event_id").notNullable();
      // 0: admin, 1: member
      table.integer("role").notNullable().default(0).comment("0: admin, 1: member");
      table.boolean("read").notNullable().default(false).comment("0: not read, 1: read");
      table.timestamps();
    }
    );
  }

  public async down() {
    await Schema.dropIfExists("event_reads");
  }
})();
