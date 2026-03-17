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

    // GET /resource
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

    // GET /resource/{Admin}
    public show: HttpDispatch = async ({ request }, { Admin }) => {
        // Show a single resource by ID
        return response().json({
            message: `show ${Admin}`
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
        // Create a new resource
        return response().json({
            message: `store`
        })
    };

    // GET /resource/{Admin}/edit
    public edit: HttpDispatch = async ({ request }, { Admin }) => {
        // Return form or data for editing resource
        return response().json({
            message: `edit ${Admin}`
        })
    };

    // PUT or PATCH /resource/{Admin}
    public update: HttpDispatch = async ({ request }, { Admin }) => {
        // Update a resource by ID
        return response().json({
            message: `update ${Admin}`
        })
    };

    // DELETE /resource/{Admin}
    public destroy: HttpDispatch = async ({ request }, { Admin }) => {
        // Delete a resource by ID
        return response().json({
            message: `delete ${Admin}`
        })
    };
}

export default AdminController;
