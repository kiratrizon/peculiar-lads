import Controller from "App/Http/Controllers/Controller.ts";

class HomeController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return response().json({
            message:"index"
        })
    };

    // GET /resource/{Home}
    public show: HttpDispatch = async ({ request }, {Home}) => {
        // Show a single resource by ID
        return response().json({
            message:`show ${Home}`
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

    // GET /resource/{Home}/edit
    public edit: HttpDispatch = async ({ request }, {Home}) => {
        // Return form or data for editing resource
        return response().json({
            message:`edit ${Home}`
        })
    };

    // PUT or PATCH /resource/{Home}
    public update: HttpDispatch = async ({ request }, {Home}) => {
        // Update a resource by ID
        return response().json({
            message:`update ${Home}`
        })
    };

    // DELETE /resource/{Home}
    public destroy: HttpDispatch = async ({ request }, {Home}) => {
        // Delete a resource by ID
        return response().json({
            message:`delete ${Home}`
        })
    };
}

export default HomeController;
