import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("first_classes", (table: Blueprint) => {
      table.id();
      table.string("name").nullable();
      table.timestamps();
    });
  }

  public async down() {
    await Schema.dropIfExists("first_classes");
  }
})();
