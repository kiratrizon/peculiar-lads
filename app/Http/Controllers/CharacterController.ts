import Controller from "App/Http/Controllers/Controller.ts";

class CharacterController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return response().json({
            message:"index"
        })
    };

    // GET /resource/{Character}
    public show: HttpDispatch = async ({ request }, {Character}) => {
        // Show a single resource by ID
        return response().json({
            message:`show ${Character}`
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

    // GET /resource/{Character}/edit
    public edit: HttpDispatch = async ({ request }, {Character}) => {
        // Return form or data for editing resource
        return response().json({
            message:`edit ${Character}`
        })
    };

    // PUT or PATCH /resource/{Character}
    public update: HttpDispatch = async ({ request }, {Character}) => {
        // Update a resource by ID
        return response().json({
            message:`update ${Character}`
        })
    };

    // DELETE /resource/{Character}
    public destroy: HttpDispatch = async ({ request }, {Character}) => {
        // Delete a resource by ID
        return response().json({
            message:`delete ${Character}`
        })
    };
}

export default CharacterController;
