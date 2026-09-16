import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { DB } from "Illuminate/Support/Facades/index.ts";

export default new (class extends Migration {
  public async up() {
    // Everyone who registered before the Code of Ethics step existed counts as
    // having done it. Without this they'd each have a null coe_accepted_at, so
    // opening /pecu-coe/{their id} would show a button that's already unlocked
    // (the 5-minute delay is measured from their long-past registration) and
    // fire a fresh welcome banner into the channel for a member who joined
    // months ago.
    //
    // Anyone applying after this migration runs starts with a null again, via
    // RecruitController.store - so only the existing backlog is stamped.
    await DB.statement(
      "UPDATE users SET coe_accepted_at = NOW() WHERE coe_accepted_at IS NULL",
    );

    // date_registered only starts being written by store() from now on.
    // CodeOfEthicsController falls back to created_at when it's null, but
    // filling it in keeps the column meaningful for every row.
    await DB.statement(
      "UPDATE users SET date_registered = created_at WHERE date_registered IS NULL",
    );
  }

  public async down() {
    // No way to tell a backfilled stamp from a genuine acknowledgement, so
    // this clears both columns wholesale - which is what rolling the feature
    // back means anyway.
    await DB.statement(
      "UPDATE users SET coe_accepted_at = NULL, date_registered = NULL",
    );
  }
})();
