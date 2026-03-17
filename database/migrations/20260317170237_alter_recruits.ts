import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("recruits", (table: Blueprint) => {
      // alter logic
      table.string("email").notNullable();
    }
    );
  }

  public async down() {
    await Schema.table("recruits", (table: Blueprint) => {
      // reverse alter logic
      table.dropColumn("email");
    }
    );
  }
})();
