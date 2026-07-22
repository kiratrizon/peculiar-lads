import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { DB, Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.table("users", (table: Blueprint) => {
      table.text("reason").nullable();
      table
        .integer("status")
        .notNullable()
        .default(0)
        .comment("0: pending, 1: invited, 2: rejected, 3: accepted");
      table.string("invitation_link").nullable();
      table
        .integer("verified")
        .notNullable()
        .default(0)
        .comment("0: not verified, 1: verified, 2: blocklisted");
      table.string("api_token").nullable().change();
    });

    // Every row that exists at this point predates the recruit/user merge,
    // so it's already a fully completed legacy account - without this, the
    // new status/verified defaults (0) would make every existing member
    // wrongly show up as a pending application.
    await DB.statement("UPDATE users SET status = 3, verified = 1");
  }

  public async down() {
    await Schema.table("users", (table: Blueprint) => {
      table.dropColumn("reason");
      table.dropColumn("status");
      table.dropColumn("invitation_link");
      table.dropColumn("verified");
      table.string("api_token").notNullable().change();
    });
  }
})();
