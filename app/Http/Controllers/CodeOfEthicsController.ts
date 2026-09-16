import Controller from "App/Http/Controllers/Controller.ts";
import { Carbon } from "helpers";
import User from "App/Models/User.ts";
import { sendWelcomeMessage } from "pecu-discord-deno/welcomeMessage.ts";
import { logErrorToDiscord } from "pecu-discord-deno/errorLog.ts";

// Minutes a recruit has to sit with the Code of Ethics before the
// acknowledge button unlocks, counted from when their application row was
// created (users.created_at).
const READ_DELAY_MINUTES = 5;

const codeOfEthicsText = (): string => {
  try {
    return Deno.readTextFileSync(basePath("rules/code_of_ethics.txt"));
  } catch (e) {
    console.error("Failed to read rules/code_of_ethics.txt", e);
    return "";
  }
};

type CoeUser = {
  id: number;
  name: string | null;
  discordId: string | null;
  registeredAt: Carbon;
  acceptedAt: string | null;
};

class CodeOfEthicsController extends Controller {
  // The user id is optional on purpose: with one, the page is a recruit's
  // acknowledgement step; without one (or with an id that no longer exists)
  // it's just the Code of Ethics, readable by anyone.
  private resolveUser = async (userId: unknown): Promise<CoeUser | null> => {
    const id = parseInt(String(userId ?? ""));
    if (!isInteger(id)) return null;

    const user = await User.find(id);
    if (!user) return null;

    return {
      id,
      // @ts-ignore //
      name: (user.name as string | null) ?? null,
      // @ts-ignore //
      discordId: (user.discord_id as string | null) ?? null,
      // date_registered is stamped on each application, so a returnee gets a
      // fresh 5 minutes instead of inheriting the unlock from their first
      // stint. Falls back to created_at for rows that predate the column.
      // @ts-ignore //
      registeredAt: Carbon.parse(
        // @ts-ignore //
        String(user.date_registered ?? user.created_at),
      ),
      // @ts-ignore //
      acceptedAt: (user.coe_accepted_at as string | null) ?? null,
    };
  };

  // Carbon's add* methods return a new instance, so this doesn't mutate
  // registeredAt. `.to("milliseconds")` is how Carbon exposes epoch time.
  private unlocksAtMs = (user: CoeUser): number =>
    user.registeredAt.addMinutes(READ_DELAY_MINUTES).to("milliseconds");

  public index: HttpDispatch = async ({ request }) => {
    const user = await this.resolveUser(request.route("user_id"));

    // unlockAtEpoch drives the countdown in the browser; the server re-checks
    // the same deadline in accept(), so a tampered button buys nothing.
    return view("coe", {
      content: codeOfEthicsText(),
      user,
      readDelayMinutes: READ_DELAY_MINUTES,
      unlockAtEpoch: user ? this.unlocksAtMs(user) : null,
      alreadyAccepted: !!user?.acceptedAt,
    });
  };

  public accept: HttpDispatch = async ({ request }) => {
    const user = await this.resolveUser(request.route("user_id"));

    if (!user) {
      return redirect().route("welcome").with(
        "message",
        "That Code of Ethics link is no longer valid.",
      );
    }

    // Idempotent: re-posting the form after acceptance must not fire a second
    // welcome banner into the channel.
    if (user.acceptedAt) {
      return redirect()
        .route("pecu-coe", { user_id: user.id })
        .with("message", "You've already acknowledged the Code of Ethics.");
    }

    if (Carbon.now().to("milliseconds") < this.unlocksAtMs(user)) {
      return redirect()
        .route("pecu-coe", { user_id: user.id })
        .with(
          "message",
          `Please take a few more minutes to read it through - the button unlocks ${READ_DELAY_MINUTES} minutes after you register.`,
        );
    }

    const record = await User.find(user.id);
    if (!record) {
      return redirect().route("welcome").with(
        "message",
        "That Code of Ethics link is no longer valid.",
      );
    }

    record.fill({ coe_accepted_at: Carbon.now().toString() });
    await record.save();

    if (user.discordId) {
      try {
        await sendWelcomeMessage(user.discordId);
      } catch (e) {
        // The acknowledgement itself is already saved - a Discord hiccup
        // shouldn't make the recruit think their click didn't register.
        console.error("Failed to send welcome message after CoE", e);
        logErrorToDiscord("CodeOfEthicsController.accept: welcome", e);
      }
    }

    return redirect()
      .route("pecu-coe", { user_id: user.id })
      .with("message", "Thank you! Welcome to PeculiarLads.");
  };
}

export default CodeOfEthicsController;
