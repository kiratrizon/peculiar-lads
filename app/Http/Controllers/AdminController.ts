import Controller from "App/Http/Controllers/Controller.ts";
import User from "App/Models/User.ts";
import Event from "App/Models/Event.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import Recruit from "../../Models/Recruit.ts";
import { Cache } from "Illuminate/Support/Facades/index.ts";

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

    public login: HttpDispatch = async ({ request, Auth }) => {
        if (request.method === "POST") {
            const credentials = await request.validate({
                email: "required|email",
                password: "required|min:8",
            });

            if (await Auth.guard("admin").attempt(credentials)) {
                return redirect().route("admin.index");
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
        const events = await Event.count();
        const recruits = await Recruit.count();
        stats.members = members;
        stats.events = events;
        stats.recruits = recruits;
        // cache the stats for 1 hour
        await Cache.put("admin.stats", stats, 1 * 60 * 60);
        return view("admin.home", {
            selected: "home",
            entity: "Admin",
            title: "Home",
            stats
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
        // @ts-ignore //
        const userId = request.user()?.id!;
        const stats = await Cache.get(`admin.${userId}.stats`) || {};
        // List all resources
        return view("admin.recruits", {
            selected: "recruits",
            entity: "Admin",
            title: "Recruits",
            stats
        });
    };

    public events: HttpDispatch = async ({ request }) => {
        // @ts-ignore //
        const userId = request.user()?.id!;
        const stats = await Cache.get(`admin.${userId}.stats`) || {};
        // List all resources
        return view("admin.events", {
            selected: "events",
            entity: "Admin",
            title: "Events",
            stats
        });
    };

    public settings: HttpDispatch = async ({ request }) => {
        // @ts-ignore //
        const userId = request.user()?.id!;
        const stats = await Cache.get(`admin.${userId}.stats`) || {};
        // List all resources
        return view("admin.settings", {
            selected: "settings",
            entity: "Admin",
            title: "Settings",
            stats
        });
    };

    public members: HttpDispatch = async ({ request }) => {
        // @ts-ignore //
        const userId = request.user()?.id!;
        const stats = await Cache.get(`admin.${userId}.stats`) || {};
        // List all resources
        return view("admin.members", {
            selected: "members",
            entity: "Admin",
            title: "Members",
            stats
        });
    };
}

export default AdminController;
