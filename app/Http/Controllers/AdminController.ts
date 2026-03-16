import Controller from "App/Http/Controllers/Controller.ts";

class AdminController extends Controller {

    public login: HttpDispatch = async ({ request }) => {
        return response().json({
            message:"login"
        })
    };

    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return response().json({
            message:"index"
        })
    };

    // GET /resource/{Admin}
    public show: HttpDispatch = async ({ request }, {Admin}) => {
        // Show a single resource by ID
        return response().json({
            message:`show ${Admin}`
        })
    };

    // GET /resource/create
    public create: HttpDispatch = async ({ request }) => {
        // Return form or data for creating resource
        return response().json({
            message:`create`
        })
    };

    // POST /resource
    public store: HttpDispatch = async ({ request }) => {
        // Create a new resource
        return response().json({
            message:`store`
        })
    };

    // GET /resource/{Admin}/edit
    public edit: HttpDispatch = async ({ request }, {Admin}) => {
        // Return form or data for editing resource
        return response().json({
            message:`edit ${Admin}`
        })
    };

    // PUT or PATCH /resource/{Admin}
    public update: HttpDispatch = async ({ request }, {Admin}) => {
        // Update a resource by ID
        return response().json({
            message:`update ${Admin}`
        })
    };

    // DELETE /resource/{Admin}
    public destroy: HttpDispatch = async ({ request }, {Admin}) => {
        // Delete a resource by ID
        return response().json({
            message:`delete ${Admin}`
        })
    };
}

export default AdminController;
