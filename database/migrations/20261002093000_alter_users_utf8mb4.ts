import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    // create_users never set a charset, so the table inherited the server
    // default (utf8mb3 / utf8_general_ci), which tops out at 3 bytes per
    // character. Any 4-byte character - every emoji - was rejected outright,
    // so a /join-guild application whose `reason` contained one died with
    // "Incorrect string value: '\xF0\x9F\xA7\xA1' for column 'reason'".
    //
    // The connection itself already speaks utf8mb4 (config/database.ts), so
    // only the stored columns need converting. CONVERT TO CHARACTER SET
    // rewrites every text column on the table, not just `reason`, since any
    // of them can receive emoji from an application form.
    await Schema.table("users", (table: Blueprint) => {
      table.charset = "utf8mb4";
      table.collation = "utf8mb4_unicode_ci";
    });
  }

  public async down() {
    // Reverting re-truncates any emoji already stored, so this is lossy.
    await Schema.table("users", (table: Blueprint) => {
      table.charset = "utf8mb3";
      table.collation = "utf8mb3_general_ci";
    });
  }
})();
