import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("recruits", (table: Blueprint) => {
      // alter logic
      table.integer("verified").notNullable().default(0).comment("0: not verified, 1: verified");
    }
    );
  }

  public async down() {
    await Schema.table("recruits", (table: Blueprint) => {
      // reverse alter logic
      table.dropColumn("verified");
    }
    );
  }
})();
