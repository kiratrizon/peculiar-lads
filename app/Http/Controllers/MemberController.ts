import Controller from "App/Http/Controllers/Controller.ts";

class MemberController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return response().json({
            message:"index"
        })
    };

    // GET /resource/{member}
    public show: HttpDispatch = async ({ request }, {member}) => {
        // Show a single resource by ID
        return response().json({
            message:`show ${member}`
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

    // GET /resource/{member}/edit
    public edit: HttpDispatch = async ({ request }, {member}) => {
        // Return form or data for editing resource
        return response().json({
            message:`edit ${member}`
        })
    };

    // PUT or PATCH /resource/{member}
    public update: HttpDispatch = async ({ request }, {member}) => {
        // Update a resource by ID
        return response().json({
            message:`update ${member}`
        })
    };

    // DELETE /resource/{member}
    public destroy: HttpDispatch = async ({ request }, {member}) => {
        // Delete a resource by ID
        return response().json({
            message:`delete ${member}`
        })
    };
}

export default MemberController;
