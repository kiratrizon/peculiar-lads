import Controller from "App/Http/Controllers/Controller.ts";
import { Carbon } from "helpers";
import User from "App/Models/User.ts";
import { sendWelcomeMessage } from "pecu-discord-deno/welcomeMessage.ts";
import { grantVerifiedRole } from "pecu-discord-deno/verifiedRole.ts";
import { logErrorToDiscord } from "pecu-discord-deno/errorLog.ts";

// minutes to wait
const READ_DELAY_MINUTES = 5;

// Same shape RecruitController.store generates and routes/web.ts constrains:
// "<id>-<YmdHis>-<uuid v4>".
const INVITE_LINK_PATTERN =
  /^\d+-\d{14}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type CoeBlock = {
  heading: boolean;
  text: string;
  paragraphs: string[][];
};

const isHeadingLine = (line: string): boolean => {
  const letters = line.replace(/[^A-Za-z]/g, "");
  if (letters.length < 3) return false;
  if (line.length > 90) return false;

  const uppercase = letters.replace(/[^A-Z]/g, "").length;
  return uppercase / letters.length >= 0.9;
};

const parseCodeOfEthics = (raw: string): CoeBlock[] => {
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!text) return [];

  return text
    .split(/\n[ \t]*\n[ \t]*\n+/)
    .map((section) => {
      const paragraphs = section
        .split(/\n[ \t]*\n/)
        .map((paragraph) =>
          paragraph
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        )
        .filter((lines) => lines.length > 0);

      const heading =
        paragraphs.length === 1 &&
        paragraphs[0].length === 1 &&
        isHeadingLine(paragraphs[0][0]);

      return {
        heading,
        text: heading ? paragraphs[0][0] : "",
        paragraphs: heading ? [] : paragraphs,
      };
    })
    .filter((block) => block.heading || block.paragraphs.length > 0);
};

const codeOfEthicsBlocks = (): CoeBlock[] => {
  try {
    return parseCodeOfEthics(
      Deno.readTextFileSync(basePath("rules/code_of_ethics.txt")),
    );
  } catch (e) {
    console.error("Failed to read rules/code_of_ethics.txt", e);
    return [];
  }
};

type CoeUser = {
  id: number;
  inviteLink: string;
  name: string | null;
  discordId: string | null;
  registeredAt: Carbon;
  acceptedAt: string | null;
};

class CodeOfEthicsController extends Controller {
  // Keyed by the invitation link rather than a row id or a Discord id: it's
  // generated per application (RecruitController.store) and is the only
  // identifier a recruit has that can't be guessed or enumerated. Signing up
  // doesn't clear it, so the link keeps working afterwards.
  private resolveUser = async (
    inviteLink: unknown,
  ): Promise<CoeUser | null> => {
    const token = String(inviteLink ?? "");
    if (!INVITE_LINK_PATTERN.test(token)) return null;

    const user = await User.where("invitation_link", token).first();
    if (!user) return null;

    return {
      // @ts-ignore //
      id: user.id as number,
      inviteLink: token,
      // @ts-ignore //
      name: (user.name as string | null) ?? null,
      // @ts-ignore //
      discordId: (user.discord_id as string | null) ?? null,
      // @ts-ignore //
      registeredAt: Carbon.parse(
        // @ts-ignore //
        String(user.date_registered ?? user.created_at),
      ),
      // @ts-ignore //
      acceptedAt: (user.coe_accepted_at as string | null) ?? null,
    };
  };

  private unlocksAtMs = (user: CoeUser): number =>
    user.registeredAt.addMinutes(READ_DELAY_MINUTES).to("milliseconds");

  public index: HttpDispatch<{ inviteLink?: string | null }> = async (
    { request },
    { inviteLink },
  ) => {
    const user = await this.resolveUser(inviteLink);

    return view("coe", {
      blocks: codeOfEthicsBlocks(),
      user,
      readDelayMinutes: READ_DELAY_MINUTES,
      unlockAtEpoch: user ? this.unlocksAtMs(user) : null,
      alreadyAccepted: !!user?.acceptedAt,
    });
  };

  public accept: HttpDispatch<{ inviteLink?: string | null }> = async (
    { request },
    { inviteLink },
  ) => {
    const user = await this.resolveUser(inviteLink);

    if (!user) {
      return redirect()
        .route("welcome")
        .with("message", "That Code of Ethics link is no longer valid.");
    }

    // Idempotent: re-posting the form after acceptance must not fire a second
    // welcome banner into the channel.
    if (user.acceptedAt) {
      return redirect()
        .route("pecu-coe", { inviteLink: user.inviteLink })
        .with("message", "You've already acknowledged the Code of Ethics.");
    }

    if (Carbon.now().to("milliseconds") < this.unlocksAtMs(user)) {
      return redirect()
        .route("pecu-coe", { inviteLink: user.inviteLink })
        .with(
          "message",
          `Please take a few more minutes to read it through - the button unlocks ${READ_DELAY_MINUTES} minutes after you register.`,
        );
    }

    const record = await User.find(user.id);
    if (!record) {
      return redirect()
        .route("welcome")
        .with("message", "That Code of Ethics link is no longer valid.");
    }

    record.fill({ coe_accepted_at: Carbon.now().toString() });
    await record.save();

    // Everything Discord-side needs an account to act on; an applicant without
    // a linked Discord id just gets the acknowledgement recorded.
    if (user.discordId) {
      try {
        await grantVerifiedRole(user.discordId, "Accepted the Code of Ethics");
        await sendWelcomeMessage(user.discordId);
      } catch (e) {
        // The acknowledgement itself is already saved - a Discord hiccup
        // shouldn't make the recruit think their click didn't register.
        console.error("Failed to finish Discord onboarding after CoE", e);
        logErrorToDiscord("CodeOfEthicsController.accept: discord", e);
      }
    }

    return redirect()
      .route("pecu-coe", { inviteLink: user.inviteLink })
      .with("message", "Thank you! Welcome to PeculiarLads.");
  };
}

export default CodeOfEthicsController;
