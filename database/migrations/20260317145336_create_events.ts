import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("events", (table: Blueprint) => {
      table.id();
      table.string("title").nullable();
      table.text("description").nullable();
      table.string("image").nullable();
      table.string("link").nullable();
      table.string("type").nullable();
      table.integer("status").nullable().default(0).comment("0: upcoming, 1: ongoing, 2: done");
      table.string("start_date").nullable();
      table.string("end_date").nullable();
      table.timestamps();
    }
    );
  }

  public async down() {
    await Schema.dropIfExists("events");
  }
})();
