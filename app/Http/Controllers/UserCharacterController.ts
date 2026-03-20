import Controller from "App/Http/Controllers/Controller.ts";

class UserCharacterController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return response().json({
            message:"index"
        })
    };

    // GET /resource/{usercharacter}
    public show: HttpDispatch = async ({ request }, {usercharacter}) => {
        // Show a single resource by ID
        return response().json({
            message:`show ${usercharacter}`
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

    // GET /resource/{usercharacter}/edit
    public edit: HttpDispatch = async ({ request }, {usercharacter}) => {
        // Return form or data for editing resource
        return response().json({
            message:`edit ${usercharacter}`
        })
    };

    // PUT or PATCH /resource/{usercharacter}
    public update: HttpDispatch = async ({ request }, {usercharacter}) => {
        // Update a resource by ID
        return response().json({
            message:`update ${usercharacter}`
        })
    };

    // DELETE /resource/{usercharacter}
    public destroy: HttpDispatch = async ({ request }, {usercharacter}) => {
        // Delete a resource by ID
        return response().json({
            message:`delete ${usercharacter}`
        })
    };
}

export default UserCharacterController;
