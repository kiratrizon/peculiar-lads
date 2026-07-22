import Controller from "App/Http/Controllers/Controller.ts";
import { Hash } from "Illuminate/Support/Facades/index.ts";
import User from "App/Models/User.ts";
import { Str } from "Illuminate/Support/index.ts";

class UserController extends Controller {
  public login: HttpDispatch = async ({ request, Auth }) => {
    if (request.method === "POST") {
      const credentials = await request.validate({
        email: "required|email",
        password: "required|min:8",
      });

      if (await Auth.guard("web").attempt(credentials)) {
        return redirect().route("user.index");
      } else {
        return redirect()
          .back()
          .withErrors({
            email: "Invalid email",
            password: "Invalid password",
          })
          .withInput();
      }
    }

    return view("user.login");
  };

  public signup: HttpDispatch = async ({ request, Auth }, { inviteLink }) => {
    // Applying (RecruitController.store) already created this row - status
    // 1 means an admin has invited it, so this just fills in the
    // credentials on that SAME row rather than creating a new one.
    const recruit = await User.where("invitation_link", inviteLink)
      .where("status", 1)
      .first();
    if (!recruit) {
      return redirect().route("welcome").withErrors({
        globalError: "Invite link is invalid",
      });
    }

    if (request.method === "POST") {
      const credentials = await request.validate(
        {
          email: "required|email",
          // password regex must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character
          // Note: use `regex:pattern` with no /slashes/ — Validator uses `new RegExp(val)` (slashes would be literal).
          // Use \\d in the string so the regex receives \d (digit), not a plain "d".
          password:
            "required|min:8|confirmed|regex:^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
        },
        {
          "password.regex":
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      );

      // The row already occupies `credentials.email` (it was captured at
      // apply time), so a plain `unique:users,email` rule would always
      // spuriously fail here - this framework's unique rule has no "except
      // this row's id" option, so the exclusion is done manually instead.
      // @ts-ignore //
      const recruitId = recruit.id as number;
      // @ts-ignore //
      const currentEmail = recruit.email as string | null;
      if (credentials.email !== currentEmail) {
        const duplicate = await User.where("email", credentials.email)
          .first();
        if (duplicate) {
          return redirect()
            .back()
            .withErrors({ email: "Email already exists" })
            .withInput(request.except(["password"]));
        }
      }

      recruit.fill({
        email: credentials.email,
        password: Hash.make(credentials.password),
        api_token: `${recruitId}-${Str.random(32)}`,
        status: 3,
      });
      await recruit.save();

      const attempt = await Auth.attempt(credentials);

      if (attempt) {
        return redirect().route("user.promptStayLogin");
      }
      return redirect().route("login");
    }

    return view("user.signup", {
      recruit,
      fromSignUp: 1,
    });
  };

  public promptStayLogin: HttpDispatch = async ({ request }) => {
    return view("user.stay-login");
  };

  public logout: HttpDispatch = async ({ request, Auth }) => {
    Auth.guard("web").logout();
    return redirect().route("login");
  };

  public members: HttpDispatch = async ({ request }) => {
    return view("user.members", {
      selected: "members",
      entity: "User",
      title: "Members",
    });
  };

  public events: HttpDispatch = async ({ request }) => {
    return view("user.events", {
      selected: "events",
      entity: "User",
      title: "Events",
    });
  };

  public settings: HttpDispatch = async ({ request }) => {
    const notif = await this.getUnreads({ request });
    // @ts-ignore //
    const user = request.user() as User;

    if (request.method === "POST") {
      const rules: Record<string, string> = {
        name: "required|min:2|max:50",
        email: "required|email|max:100",
      };

      const password = request.input("password") as string | undefined;
      if (password) {
        rules.current_password = "required";
        rules.password =
          "required|min:8|confirmed|regex:^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$";
      }

      const credentials = await request.validate(rules, {
        "password.regex":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });

      const duplicate = await User.where("email", credentials.email)
        // @ts-ignore //
        .where("id", "!=", user.id)
        .first();

      if (duplicate) {
        return redirect()
          .back()
          .withErrors({
            email: "Email is already in use.",
          })
          .withInput(
            request.except([
              "password",
              "password_confirmation",
              "current_password",
            ]),
          );
      }

      if (password) {
        if (!Hash.check(credentials.current_password, user.getAuthPassword())) {
          return redirect()
            .back()
            .withErrors({
              current_password: "Current password is incorrect.",
            })
            .withInput(
              request.except([
                "password",
                "password_confirmation",
                "current_password",
              ]),
            );
        }
      }

      user.fill({
        name: credentials.name,
        email: credentials.email,
        ...(password ? { password: Hash.make(credentials.password) } : {}),
      });
      await user.save();

      return redirect()
        .route("user.settings")
        .with("message", "Profile updated successfully.");
    }

    return view("user.settings", {
      selected: "settings",
      entity: "User",
      title: "Settings",
      notif,
      user,
    });
  };
}

export default UserController;
