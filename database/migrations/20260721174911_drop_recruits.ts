import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { DB, Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.dropIfExists("recruits");

    // recruit_reads.recruit_id used to reference recruits.id; going forward
    // it references users.id instead. Existing rows would silently point at
    // whatever unrelated user now happens to share that numeric id, so this
    // purely-cosmetic notification-read table gets a one-time reset rather
    // than carrying stale references forward.
    await DB.statement("DELETE FROM recruit_reads");
  }

  public async down() {
    await Schema.create("recruits", (table: Blueprint) => {
      table.id();
      table.integer("nstg").notNullable();
      table.integer("class").notNullable();
      table.string("ign").notNullable();
      table.string("discord").notNullable();
      table.string("discord_id", 20).nullable();
      table.text("reason").notNullable();
      table
        .integer("status")
        .notNullable()
        .default(0)
        .comment("0: pending, 1: invited, 2: rejected, 3: accepted");
      table.string("email").notNullable();
      table.string("invitation_link").nullable();
      table
        .integer("verified")
        .notNullable()
        .default(0)
        .comment("0: not verified, 1: verified");
      table.timestamps();
    });
  }
})();
