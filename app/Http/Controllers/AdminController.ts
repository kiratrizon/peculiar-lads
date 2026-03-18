import Controller from "App/Http/Controllers/Controller.ts";
import User from "App/Models/User.ts";
import Event from "App/Models/Event.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import Recruit from "../../Models/Recruit.ts";
import { Cache } from "Illuminate/Support/Facades/index.ts";
import HonoRequest from "HonoHttp/HonoRequest.d.ts";
import EventRead from "../../Models/EventRead.ts";
import RecruitRead from "../../Models/RecruitRead.ts";

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

            if (await Auth.guard("admin").attempt(credentials)) {
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
        const recruits = await Recruit.where("status", "!=", 2).get();
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
        const recruits = await Recruit.all();
        return response().json({
            recruits
        });
    };

    public recruits: HttpDispatch = async ({ request }) => {
        const notif = await this.getUnreads({ request });
        // List all resources
        return view("admin.recruits", {
            selected: "recruits",
            entity: "Admin",
            title: "Recruits",
            notif
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
        // List all resources
        return view("admin.settings", {
            selected: "settings",
            entity: "Admin",
            title: "Settings",
            notif
        });
    };

    public members: HttpDispatch = async ({ request }) => {
        const notif = await this.getUnreads({ request });
        // List all resources
        return view("admin.members", {
            selected: "members",
            entity: "Admin",
            title: "Members",
            notif
        });
    };
}

export default AdminController;
