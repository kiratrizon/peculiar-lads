import Controller from "App/Http/Controllers/Controller.ts";
import { Cache } from "Illuminate/Support/Facades/index.ts";

class UserController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        const stats = await Cache.get("admin.stats") || {};
        // List all resources
        return view("admin.members", {
            selected: "members",
            entity: "Admin",
            title: "Members",
            stats
        });
    };

    // GET /resource/{User}
    public show: HttpDispatch = async ({ request }, { User }) => {
        // Show a single resource by ID
        return response().json({
            message: `show ${User}`
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

    // GET /resource/{User}/edit
    public edit: HttpDispatch = async ({ request }, { User }) => {
        // Return form or data for editing resource
        return response().json({
            message: `edit ${User}`
        })
    };

    // PUT or PATCH /resource/{User}
    public update: HttpDispatch = async ({ request }, { User }) => {
        // Update a resource by ID
        return response().json({
            message: `update ${User}`
        })
    };

    // DELETE /resource/{User}
    public destroy: HttpDispatch = async ({ request }, { User }) => {
        // Delete a resource by ID
        return response().json({
            message: `delete ${User}`
        })
    };
}

export default UserController;
