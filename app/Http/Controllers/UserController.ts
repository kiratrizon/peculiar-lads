import Controller from "App/Http/Controllers/Controller.ts";
import Recruit from "../../Models/Recruit.ts";
import { Hash } from "Illuminate/Support/Facades/index.ts";
import User, { UserSchema } from "App/Models/User.ts";
import { Str } from "Illuminate/Support/index.ts";
import UserCharacter, { UserCharacterSchema } from "../../Models/UserCharacter.ts";

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
                return redirect().back().withErrors({
                    email: "Invalid email",
                    password: "Invalid password",
                }).withInput();
            }
        }

        return view("user.login");
    }

    public signup: HttpDispatch = async ({ request, Auth }, { inviteLink }) => {
        // your logic here

        // verify the invite link
        const recruit = await Recruit.where("invitation_link", inviteLink).where("status", 1).first();
        if (!recruit) {
            return redirect().route("welcome").withErrors({
                "globalError": "Invite link is invalid"
            });
        }

        if (request.method === "POST") {
            const credentials = await request.validate({
                email: "required|email|unique:users,email",
                // password regex must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character
                // Note: use `regex:pattern` with no /slashes/ — Validator uses `new RegExp(val)` (slashes would be literal).
                // Use \\d in the string so the regex receives \d (digit), not a plain "d".
                password:
                    "required|min:8|confirmed|regex:^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
            },
                {
                    "password.regex": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
                    "email.unique": "Email already exists",
                }
            );

            const userData: UserSchema = {
                email: credentials.email,
                password: Hash.make(credentials.password),
                // @ts-ignore //
                name: recruit.ign as string,
                // @ts-ignore //
                api_token: recruit.id + "-" + Str.random(32) as string,
            }

            const user = await User.create(userData);

            if (user) {
                recruit.fill({
                    status: 3,
                })
                await recruit.save();
                // create user character
                const userCharacter: UserCharacterSchema = {
                    user_id: user.id,
                    main: true,
                    third_class_id: recruit.class,
                    nstg_level_id: recruit.nstg,
                    ign: recruit.ign
                }
                await UserCharacter.create(userCharacter);

                const attempt = await Auth.attempt(credentials);

                if (attempt) {
                    return redirect().route("user.promptStayLogin");
                }
                return redirect().route("login");
            } else {
                return redirect().route("signup").withInput(request.except(['password'])).withErrors({
                    "globalError": "Failed to create user"
                });
            }
        }

        return view("user.signup", {
            recruit
        });
    }


    public promptStayLogin: HttpDispatch = async ({ request }) => {
        return view("user.stay-login");
    }

    public logout: HttpDispatch = async ({ request, Auth }) => {
        Auth.guard("web").logout();
        return redirect().route("login");
    }

    public members: HttpDispatch = async ({ request }) => {
        return view("user.members", {
            selected: "members",
            entity: "User",
            title: "Members",
        });
    }

    public events: HttpDispatch = async ({ request }) => {
        return view("user.events", {
            selected: "events",
            entity: "User",
            title: "Events",
        });
    }

    public settings: HttpDispatch = async ({ request }) => {
        return view("user.settings", {
            selected: "settings",
            entity: "User",
            title: "Settings",
        });
    }
}

export default UserController;