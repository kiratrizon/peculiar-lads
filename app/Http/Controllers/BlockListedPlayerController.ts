import Controller from "App/Http/Controllers/Controller.ts";

class BlockListedPlayerController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return view("blocklisted.index", {
            title: "Blocklisted Players",
        })
    };

    // GET /resource/{blocklistedplayer}
    public show: HttpDispatch = async ({ request }, { player }) => {
        // Show a single resource by ID
        return response().json({
            message: `show ${player}`
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

    // GET /resource/{player}/edit
    public edit: HttpDispatch = async ({ request }, { player }) => {
        // Return form or data for editing resource
        return response().json({
            message: `edit ${player}`
        })
    };

    // PUT or PATCH /resource/{player}
    public update: HttpDispatch = async ({ request }, { player }) => {
        // Update a resource by ID
        return response().json({
            message: `update ${player}`
        })
    };

    // DELETE /resource/{player}
    public destroy: HttpDispatch = async ({ request }, { player }) => {
        // Delete a resource by ID
        return response().json({
            message: `delete ${player}`
        })
    };
}

export default BlockListedPlayerController;
