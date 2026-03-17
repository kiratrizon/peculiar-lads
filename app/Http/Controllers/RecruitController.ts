import Controller from "App/Http/Controllers/Controller.ts";
import Recruit from "../../Models/Recruit.ts";
import NSTGLevel from "../../Models/NSTGLevel.ts";
import ThirdClass from "../../Models/ThirdClass.ts";
import { Resend } from "resend";
import Admin from "../../Models/Admin.ts";
import { Cache } from "Illuminate/Support/Facades/index.ts";

class RecruitController extends Controller {

  private static mailer: Resend;

  private static initMailer() {
    if (!this.mailer) {
      this.mailer = new Resend(env("RESEND_API_KEY",
        ""
      ));
    }
  }

  // GET /resource
  public index: HttpDispatch = async ({ request }) => {
    const stats = await Cache.get("admin.stats") || {};
    // List all resources
    return view("admin.recruits", {
      selected: "recruits",
      entity: "Admin",
      title: "Recruits",
      stats
    });
  };

  public getRecruits: HttpDispatch = async ({ request }) => {
    const recruits = await Recruit.all();
    return response().json({
      recruits
    });
  };

  // GET /resource/{Recruit}
  public show: HttpDispatch = async ({ request }, { Recruit }) => {
    // Show a single resource by ID
    return response().json({
      message: `show ${Recruit}`
    })
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
      ign: "required|min:4|max:10",
      class: "required",
      nstg: "required",
      discord: "required|min:4|max:50",
      reason: "required|min:10|max:500",
      email: "required|email|min:4|max:50",
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
    const recruit = await Recruit.create(credentials);

    if (recruit) {
      const adminEmails = await Admin.query().select("email").whereNotNull("email").where("email", "!=", "").get();
      if (adminEmails.length > 0) {

        RecruitController.initMailer();
        try {
          const to: string[] = [];
          const emails = adminEmails.map((admin) => admin.getAttribute("email") as string);
          if (to.length > 0) {
            await RecruitController.mailer.emails.send({
              from: "Eirazyn <onboarding@resend.dev>",
              to: emails,
              subject: "New Recruit Application - " + recruit.getAttribute("ign"),
              html: `
            <p>A new recruit application has been submitted. Please review it.</p>
            <p>IGN: ${recruit.getAttribute("ign")}</p>
            <p>Class: ${classExist.getAttribute("name")}</p>
            <p>NSTG: ${nstgExist.getAttribute("level")}</p>
            <p>Discord: ${recruit.getAttribute("discord")}</p>
            <p>Reason: ${recruit.getAttribute("reason")}</p>
            <p>Email: ${recruit.getAttribute("email") as string}</p>
            `,
            });
          }
        } catch (error) {
          console.error(error);
        }
      }

      return redirect().route("welcome").with("message", `Hello ${recruit.getAttribute("ign")}, your application has been submitted successfully. Please wait for review. And we'll send you a message via your provided email.`);
    }
    return redirect().route("welcome").with("message", `Something went wrong. Please try again later.`).withInput();
  };

  // GET /resource/{Recruit}/edit
  public edit: HttpDispatch = async ({ request }, { Recruit }) => {
    // Return form or data for editing resource
    return response().json({
      message: `edit ${Recruit}`
    })
  };

  // PUT or PATCH /resource/{Recruit}
  public update: HttpDispatch = async ({ request }, { Recruit }) => {
    // Update a resource by ID
    return response().json({
      message: `update ${Recruit}`
    })
  };

  // DELETE /resource/{Recruit}
  public destroy: HttpDispatch = async ({ request }, { Recruit }) => {
    // Delete a resource by ID
    return response().json({
      message: `delete ${Recruit}`
    })
  };
}

export default RecruitController;
