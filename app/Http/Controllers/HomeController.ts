import Controller from "App/Http/Controllers/Controller.ts";

class HomeController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {

        return view("user.home.index", {
            selected: "home",
            entity: "User",
            title: "Home",
        });
    };

    // GET /resource/{home}
    public show: HttpDispatch = async ({ request }, { home }) => {
        // Show a single resource by ID
        return response().json({
            message: `show ${home}`
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

    // GET /resource/{home}/edit
    public edit: HttpDispatch = async ({ request }, { home }) => {
        // Return form or data for editing resource
        return response().json({
            message: `edit ${home}`
        })
    };

    // PUT or PATCH /resource/{home}
    public update: HttpDispatch = async ({ request }, { home }) => {
        // Update a resource by ID
        return response().json({
            message: `update ${home}`
        })
    };

    // DELETE /resource/{home}
    public destroy: HttpDispatch = async ({ request }, { home }) => {
        // Delete a resource by ID
        return response().json({
            message: `delete ${home}`
        })
    };
}

export default HomeController;
