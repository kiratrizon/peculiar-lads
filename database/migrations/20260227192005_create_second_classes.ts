import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("second_classes", (table: Blueprint) => {
      table.id();
      table.integer("first_class_id").notNullable();
      table.string("name").notNullable();
      table.timestamps();
    });
  }

  public async down() {
    await Schema.dropIfExists("second_classes");
  }
})();
