import Controller from "App/Http/Controllers/Controller.ts";
import User from "App/Models/User.ts";
import Event from "App/Models/Event.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import Admin from "App/Models/Admin.ts";
import Recruit from "../../Models/Recruit.ts";
import { Cache, DB, Hash, Validator } from "Illuminate/Support/Facades/index.ts";
import HonoRequest from "HonoHttp/HonoRequest.d.ts";
import EventRead from "../../Models/EventRead.ts";
import RecruitRead from "../../Models/RecruitRead.ts";
import Character from "App/Models/Character.ts";

class AdminController extends Controller {

    public logout: HttpDispatch = async ({ request, Auth }) => {
        Auth.guard("admin").logout();
        return redirect().route("admin.login");
    };

    public getMembers: HttpDispatch = async ({ request }) => {
        const members = await User.all();
        return response().json({
            members
        });
    };

    /**
     * Login admin
     */
    public login: HttpDispatch = async ({ request, Auth }) => {
        if (request.method === "POST") {
            const credentials = await request.validate({
                email: "required|email",
                password: "required|min:8",
                redirect: "nullable|url",
                remember: "nullable|boolean",
            });

            if (await Auth.guard("admin").attempt(credentials, credentials.remember)) {
                const redirectUrl = credentials.redirect || route("admin.index");
                return redirect().to(redirectUrl);
            } else {
                return redirect().back().withErrors({
                    email: "Invalid credentials",
                    password: "Invalid credentials"
                }).withInput(request.except(['password']));
            }
        }
        return view("admin.login", {
            entity: "Admin"
        })
    };

    public index: HttpDispatch = async ({ request }) => {

        const stats = {
            members: 0,
            events: 0,
            recruits: 0,
        };

        const members = await User.count();
        const events = await Event.where("status", "!=", 2).get();
        const recruits = await Recruit.where("status", 0).get();
        stats.members = members;
        stats.events = events.length;
        stats.recruits = recruits.length;
        // @ts-ignore //
        const userId = request.user()?.id!;

        const unreads:
            {
                recruits: number[],
                events: number[],
            } = {
            recruits: [],
            events: [],
        };

        const eventIds: number[] = [];
        events.forEach((event) => {
            // @ts-ignore //
            eventIds.push(event.id);
        });
        const recruitIds: number[] = [];
        recruits.forEach((recruit) => {
            // @ts-ignore //
            recruitIds.push(recruit.id);
        });

        for (const eventId of eventIds) {
            // check if event has read by admin
            const eventRead = await EventRead.where("event_id", eventId).where("admin_user_id", userId).where("read", false).where("role", 0).first();
            if (!eventRead) {
                unreads.events.push(eventId);
            }
        }

        for (const recruitId of recruitIds) {
            // check if recruit has read by admin
            const recruitRead = await RecruitRead.where("recruit_id", recruitId).where("admin_id", userId).where("read", false).first();
            if (!recruitRead) {
                unreads.recruits.push(recruitId);
            }
        }

        // save to cache
        await Cache.put(`admin.${userId}.unreads`, unreads, 1 * 60 * 60);
        return view("admin.home", {
            selected: "home",
            entity: "Admin",
            title: "Home",
            stats,
            notif: unreads,
        });
    };

    public getEvents: HttpDispatch = async ({ request }) => {
        const events = await Event.all();
        return response().json({
            events
        });
    };

    public getRecruits: HttpDispatch = async ({ request }) => {




    };

    public recruits: HttpDispatch = async ({ request }) => {
        const notif = await this.getUnreads({ request });

        const page = parseInt(request.query("page") as string || "1");
        const perPage = parseInt(request.query("perPage") as string || "10");
        const urlInstance = new URL(request.url);

        const statusParam = request.query("status") as string | undefined;
        let statusFilter = "all";
        if (statusParam && statusParam !== "all") {
            const parsed = parseInt(statusParam);
            if ([0, 1, 2].includes(parsed)) {
                statusFilter = String(parsed);
            }
        }

        const recruitQuery = Recruit.query();
        recruitQuery.where("recruits.status", "!=", 3);

        if (statusFilter !== "all" && ["0", "1", "2"].includes(statusFilter)) {
            recruitQuery.where("recruits.status", parseInt(statusFilter));
        }

        const fields = [
            "recruits.id",
            "recruits.ign",
            "recruits.discord",
            "recruits.email",
            "recruits.status",
            "recruits.verified",
            "nstg_level.code as nstg",
            "third_classes.name as class",
        ];

        recruitQuery.select(...fields.map((e) => DB.raw(e)));
        recruitQuery
            .join("nstg_level", "recruits.nstg", "=", "nstg_level.id")
            .join("third_classes", "recruits.class", "=", "third_classes.id");
        recruitQuery.orderBy("recruits.created_at", "desc");

        const recruits = await recruitQuery.paginate(page, perPage, urlInstance);

        return view("admin.recruits", {
            selected: "recruits",
            entity: "Admin",
            title: "Recruits",
            notif,
            recruits,
            statusFilter,
        });
    };

    public events: HttpDispatch = async ({ request }) => {
        const notif = await this.getUnreads({ request });

        // List all resources
        return view("admin.events", {
            selected: "events",
            entity: "Admin",
            title: "Events",
            notif
        });
    };

    public settings: HttpDispatch = async ({ request }) => {
        const notif = await this.getUnreads({ request });
        // @ts-ignore //
        const admin = request.user() as Admin;

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

            const duplicate = await Admin
                .where("email", credentials.email)
                // @ts-ignore //
                .where("id", "!=", admin.id)
                .first();

            if (duplicate) {
                return redirect().back().withErrors({
                    email: "Email is already in use.",
                }).withInput(request.except(["password", "password_confirmation", "current_password"]));
            }

            if (password) {
                if (!Hash.check(credentials.current_password, admin.getAuthPassword())) {
                    return redirect().back().withErrors({
                        current_password: "Current password is incorrect.",
                    }).withInput(request.except(["password", "password_confirmation", "current_password"]));
                }
            }

            admin.fill({
                name: credentials.name,
                email: credentials.email,
                ...(password ? { password: Hash.make(credentials.password) } : {}),
            });
            await admin.save();

            return redirect().route("admin.settings").with("message", "Profile updated successfully.");
        }

        return view("admin.settings", {
            selected: "settings",
            entity: "Admin",
            title: "Settings",
            notif,
            admin,
        });
    };

    public members: HttpDispatch = async ({ request }) => {
        const notif = await this.getUnreads({ request });

        // paginate
        const page = parseInt(request.query("page") as string || "1");
        const perPage = parseInt(request.query("perPage") as string || "10");

        const urlInstance = new URL(request.url);
        const members = await User.with("userCharacters").paginate(page, perPage, urlInstance);
        // console.log(members);
        // List all resources
        const [page, perPage] = [parseInt(request.query("page") as string || "1"), parseInt(request.query("perPage") as string || "10")];
        const urlInstance = new URL(request.url);
        // const members = await User.paginate(page, perPage, urlInstance);
        const characterQuery = Character.query();

        const fields = [
            "characters.id",
            "characters.ign",
            "nstg_level.code as nstg",
            "third_classes.name as class",
            "users.discord",
            "users.name as nickname",
            "characters.main",
            "characters.duration"
        ];

        characterQuery.select(...fields.map((e)=>DB.raw(e)));
        characterQuery.join("nstg_level", "characters.nstg_level_id", "=", "nstg_level.id")
        .join("third_classes", "characters.third_class_id", "=", "third_classes.id")
        .leftJoin("users", "characters.user_id", "=", "users.id");
        const search_ign = request.query('search_ign');
        if (isset(search_ign)){
            const validator = await Validator.make(request.query(), {
                search_ign: "required|max:10|alpha_num"
            });
            if (!validator.fails()){
                characterQuery.where("characters.ign", "like", `%${search_ign}%`);
            }
        }

        characterQuery.orderBy("characters.nstg_level_id", "desc");
        characterQuery.orderBy("characters.duration", "desc");

        const characters = await characterQuery.paginate(page, perPage, urlInstance)
        
        return view("admin.members", {
            selected: "members",
            entity: "Admin",
            title: "Members and Characters",
            notif,
            characters,
            search_ign
        });
    };
}

export default AdminController;
