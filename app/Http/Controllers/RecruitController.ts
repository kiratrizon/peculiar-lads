import Controller from "App/Http/Controllers/Controller.ts";
import User, { UserSchema } from "../../Models/User.ts";
import Character from "../../Models/Character.ts";
import NSTGLevel from "../../Models/NSTGLevel.ts";
import ThirdClass from "../../Models/ThirdClass.ts";
import { Resend } from "resend";
import Admin from "../../Models/Admin.ts";
import { Cache, DB } from "Illuminate/Support/Facades/index.ts";
import BlockListedPlayer from "../../Models/BlockListedPlayer.ts";
import { discordRest } from "pecu-discord-deno/rest.ts";
import { logErrorToDiscord } from "pecu-discord-deno/errorLog.ts";

class RecruitController extends Controller {

  private static mailer: Resend;

  private static initMailer() {
    if (!this.mailer) {
      this.mailer = new Resend(env("RESEND_API_KEY") as string);
    }
  }

  // GET /resource
  public index: HttpDispatch = async ({ request }) => {
    return "hello world";
  };

  public getRecruits: HttpDispatch = async ({ request }) => {
    const recruits = await User.where("status", "!=", 3).get();
    return response().json({
      recruits
    });
  };

  // GET /resource/{Recruit}
  public show: HttpDispatch<{ recruit: User }> = async ({ request }, { recruit }) => {
    // @ts-ignore //
    const recruitId = recruit.id as number;
    const character = await Character.where("user_id", recruitId).first();
    if (!character) {
      return redirect().route("admin.recruits").with("message", "Application character not found");
    }
    // @ts-ignore //
    const nstgID = character.nstg_level_id as number;
    // @ts-ignore //
    const classID = character.third_class_id as number;
    const nstg = await NSTGLevel.find(nstgID);
    const classJob = await ThirdClass.find(classID);
    if (!nstg) {
      return redirect().route("admin.recruits").with("message", "NSTG not found");
    }
    if (!classJob) {
      return redirect().route("admin.recruits").with("message", "Class not found");
    }

    recruit.forceFill({
      // @ts-ignore //
      ign: character.ign as string,
      myNstg: nstg.toObject(),
      myClass: classJob.toObject(),
    });
    // check if recruit has read by admin
    return view("admin.recruits.view", {
      title: "View Recruit",
      recruit: recruit,
      entity: "Admin",
      selected: "recruits",
      notif: await this.getUnreads({ request }),
    });
  };

  // GET /resource/create
  public create: HttpDispatch = async ({ request }) => {
    // Return form or data for creating resource
    return response().json({
      message: `create`
    })
  };

  // POST /resource
  public store: HttpDispatch = async ({ request }) => {
    const credentials = await request.validate({
      ign: "required|alpha_num|min:4|max:10",
      class: "required",
      nstg: "required",
      discord: "required|min:4|max:50",
      discord_id: "nullable|max:20",
      reason: "required|min:10|max:500",
      email: "required|email|min:4|max:50|unique:users,email",
    });

    // check if class is a number and exist in ThirdClass
    const classId = parseInt(credentials.class);
    if (!isInteger(classId)) {
      return redirect().back().withErrors({
        class: "Class is required",
      }).withInput(request.except(['class']));
    }
    // @ts-ignore //
    credentials.class = classId;
    const classExist = await ThirdClass.find(classId);
    if (!classExist) {
      return redirect().back().withErrors({
        class: "Class is not valid",
      }).withInput(request.except(['class']));
    }
    // check if nstg is a number and exist in NSTGLevel
    const nstgId = parseInt(credentials.nstg);
    if (!isInteger(nstgId)) {
      return redirect().back().withErrors({
        nstg: "NSTG is required",
      }).withInput(request.except(['nstg']));
    }
    // @ts-ignore //
    credentials.nstg = nstgId;
    const nstgExist = await NSTGLevel.find(nstgId);
    if (!nstgExist) {
      return redirect().back().withErrors({
        nstg: "NSTG is not valid",
      }).withInput(request.except(['nstg']));
    }
    const recruit = await User.create({
      email: credentials.email,
      name: credentials.ign,
      discord: credentials.discord,
      discord_id: credentials.discord_id,
      reason: credentials.reason,
    });

    if (recruit) {
      // @ts-ignore //
      const recruitId = recruit.id as number;
      await Character.create({
        user_id: recruitId,
        main: true,
        third_class_id: classId,
        nstg_level_id: nstgId,
        ign: credentials.ign,
      });

      const discordId = credentials.discord_id as string | undefined;
      if (discordId) {
        try {
          const guildId = env("DISCORD_GUILD_ID") as string;
          const autoRoleId = env("AUTO_ROLE_ID") as string;
          const verifiedRoleId = env("VERIFIED_ROLE_ID") as string;
          const guildMember = await discordRest.getMember(guildId, discordId);

          if (autoRoleId && guildMember.roles.includes(autoRoleId)) {
            await discordRest.removeRole(
              guildId,
              discordId,
              autoRoleId,
              "Submitted guild application",
            );
          }

          if (!guildMember.roles.includes(verifiedRoleId)) {
            await discordRest.addRole(
              guildId,
              discordId,
              verifiedRoleId,
              "Submitted guild application",
            );
          }
        } catch (error) {
          console.error("Failed to update roles for recruit", error);
          logErrorToDiscord("RecruitController.store: role sync", error);
        }
      }

      // Automatic blocklist check + immediate invite link generation, so the
      // applicant can go straight to signup instead of waiting for an admin
      // to manually review and click "invite" (RecruitController.inviteRecruit
      // and .verify still exist for admins to re-check/override afterward).
      const isBlackListed = await BlockListedPlayer.whereRaw(
        DB.raw(`lower(ign) = ?`),
        [credentials.ign.toLowerCase()],
      ).count();

      let signupUrl: string | null = null;

      if (isBlackListed > 0) {
        recruit.fill({ verified: 2, status: 2 });
      } else {
        const timeNow = date("YmdHis");
        const invitationLink = `${recruitId}-${timeNow}-${crypto.randomUUID()}`;
        recruit.fill({
          verified: 1,
          status: 1,
          invitation_link: invitationLink,
        });
        signupUrl = `${env("PECU_WEB")}signup/${invitationLink}`;
      }
      await recruit.save();

      if (discordId && signupUrl) {
        try {
          const dmChannel = await discordRest.getDmChannel(discordId);
          await discordRest.sendMessage(dmChannel.id, {
            content:
              `Your application looks good! Complete your signup here: ${signupUrl}`,
          });
        } catch (error) {
          console.error("Failed to DM signup link to recruit", error);
          logErrorToDiscord("RecruitController.store: signup DM", error);
        }
      }

      const adminEmails = await Admin.query().select("email").whereNotNull("email").where("email", "!=", "").get();
      if (adminEmails.length > 0) {

        RecruitController.initMailer();
        try {
          const to: string[] = ["genesistroy.fdc@gmail.com"];
          const emails = adminEmails.map((admin) => admin.getAttribute("email") as string);
          if (to.length > 0) {
            const data = {
              ign: credentials.ign as string,
              className: classExist.getAttribute("name") as string,
              nstgCode: nstgExist.getAttribute("code") as string,
              nstgName: nstgExist.getAttribute("name") as string,
              discord: recruit.getAttribute("discord") as string,
              email: recruit.getAttribute("email") as string,
              reason: recruit.getAttribute("reason") as string,
              reviewUrl: route("admin.recruits.show", { recruit: recruit.getAttribute("id") }),
            }
            await RecruitController.mailer.emails.send({
              from: "Eirazyn <onboarding@resend.dev>",
              to,
              subject: "New Recruit Application - " + credentials.ign,
              html: this.recruitApplicationTemplate(data),
            });
          }
        } catch (error) {
          console.error(error);
          logErrorToDiscord("RecruitController.store: admin email", error);
        }
      }

      const successMessage = signupUrl
        ? `Hello ${credentials.ign}, your application has been approved! Complete your signup here: ${signupUrl}`
        : `Hello ${credentials.ign}, your application has been submitted. An admin will need to review it manually before you can sign up.`;

      return redirect().route("welcome").with("message", successMessage);
    }
    return redirect().route("welcome").with("message", `Something went wrong. Please try again later.`).withInput();
  };

  private recruitApplicationTemplate(data: {
    ign: string;
    className: string;
    nstgCode: string;
    nstgName: string;
    discord: string;
    email: string;
    reason: string;
    reviewUrl?: string;
  }) {
    return `
  <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 20px; color: #e2e8f0;">
    
    <div style="max-width: 600px; margin: auto; background: rgba(15,23,42,0.95); border-radius: 12px; overflow: hidden; border: 1px solid rgba(234,179,8,0.4);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #eab308, #facc15); padding: 16px; text-align: center;">
        <h2 style="margin: 0; color: #1e293b;">📩 New Recruit Application</h2>
      </div>

      <!-- Body -->
      <div style="padding: 20px;">
        <p style="margin-bottom: 16px; color: #cbd5f5;">
          A new recruit has applied to join your guild.
        </p>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; color: #94a3b8;">IGN</td>
            <td style="padding: 8px; font-weight: bold;">${data.ign}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #94a3b8;">Class</td>
            <td style="padding: 8px;">${data.className}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #94a3b8;">NSTG</td>
            <td style="padding: 8px;">${data.nstgCode} - ${data.nstgName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #94a3b8;">Discord</td>
            <td style="padding: 8px;">${data.discord}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #94a3b8;">Email</td>
            <td style="padding: 8px;">${data.email}</td>
          </tr>
        </table>

        <!-- Reason -->
        <div style="margin-top: 16px; padding: 12px; background: rgba(30,41,59,0.8); border-radius: 8px; border-left: 4px solid #eab308;">
          <p style="margin: 0; color: #94a3b8;">Reason</p>
          <p style="margin-top: 6px;">${data.reason}</p>
        </div>

        ${data.reviewUrl
        ? `
        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.reviewUrl}" style="display: inline-block; padding: 10px 18px; background: #eab308; color: #1e293b; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Review Application
          </a>
        </div>
        `
        : ""
      }

      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 12px; font-size: 12px; color: #64748b;">
        Guild Recruitment System
      </div>

    </div>
  </div>
  `;
  }

  public inviteRecruit: HttpDispatch<{ recruit: User }> = async ({ request }, { recruit }) => {

    // @ts-ignore //
    const recruitId = recruit.id;
    const timeNow = date("YmdHis");
    const randomString = `${recruitId}-${timeNow}-${crypto.randomUUID()}`;

    recruit.fill({
      status: 1,
      invitation_link: randomString,
    });
    const saved = await recruit.save();

    if (saved) {
      return response().json({
        message: "Invitation link sent successfully",
        invitation_link: recruit.getAttribute("invitation_link") as string
      })
    }
    return response().json({
      message: "Something went wrong"
    }, 500)
  };

  public verify: HttpDispatch<{ recruit: User }> = async ({ request }, { recruit }) => {

    // @ts-ignore //
    const ign = recruit.name as string;

    const isBlackListed = await BlockListedPlayer.whereRaw(DB.raw(`lower(ign) = ?`), [ign.toLowerCase()]).count();
    let verifyValue: UserSchema["verified"] = 0;
    if (isBlackListed > 0) {
      verifyValue = 2;
    } else {
      verifyValue = 1;
    }
    recruit.fill({
      verified: verifyValue,
    });
    try {
      const _ = await recruit.save();
    } catch (_error) {
      // 
    }
    return response().json({
      verified: verifyValue
    })
  }

  public decline: HttpDispatch<{ recruit: User }> = async ({ request }, { recruit }) => {
    // @ts-ignore //
    recruit.fill({
      status: 2,
    });
    try {
      const _ = await recruit.save();
      return response().json({
        message: "Recruit rejected successfully",
      })
    } catch (_error) {
      return response().json({
        message: "Something went wrong",
      }, 500)
    }
  }
}

export default RecruitController;
