import Controller from "App/Http/Controllers/Controller.ts";

class BlockListedPlayerController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return response().json({
            message:"index"
        })
    };

    // GET /resource/{blocklistedplayer}
    public show: HttpDispatch = async ({ request }, {blocklistedplayer}) => {
        // Show a single resource by ID
        return response().json({
            message:`show ${blocklistedplayer}`
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

    // GET /resource/{blocklistedplayer}/edit
    public edit: HttpDispatch = async ({ request }, {blocklistedplayer}) => {
        // Return form or data for editing resource
        return response().json({
            message:`edit ${blocklistedplayer}`
        })
    };

    // PUT or PATCH /resource/{blocklistedplayer}
    public update: HttpDispatch = async ({ request }, {blocklistedplayer}) => {
        // Update a resource by ID
        return response().json({
            message:`update ${blocklistedplayer}`
        })
    };

    // DELETE /resource/{blocklistedplayer}
    public destroy: HttpDispatch = async ({ request }, {blocklistedplayer}) => {
        // Delete a resource by ID
        return response().json({
            message:`delete ${blocklistedplayer}`
        })
    };
}

export default BlockListedPlayerController;
