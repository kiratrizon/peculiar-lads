import Controller from "App/Http/Controllers/Controller.ts";

class EventController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return response().json({
            message:"index"
        })
    };

    // GET /resource/{Event}
    public show: HttpDispatch = async ({ request }, {Event}) => {
        // Show a single resource by ID
        return response().json({
            message:`show ${Event}`
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

    // GET /resource/{Event}/edit
    public edit: HttpDispatch = async ({ request }, {Event}) => {
        // Return form or data for editing resource
        return response().json({
            message:`edit ${Event}`
        })
    };

    // PUT or PATCH /resource/{Event}
    public update: HttpDispatch = async ({ request }, {Event}) => {
        // Update a resource by ID
        return response().json({
            message:`update ${Event}`
        })
    };

    // DELETE /resource/{Event}
    public destroy: HttpDispatch = async ({ request }, {Event}) => {
        // Delete a resource by ID
        return response().json({
            message:`delete ${Event}`
        })
    };
}

export default EventController;
