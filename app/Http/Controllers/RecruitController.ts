import Controller from "App/Http/Controllers/Controller.ts";

class RecruitController extends Controller {
    // GET /resource
    public index: HttpDispatch = async ({ request }) => {
        // List all resources
        return response().json({
            message:"index"
        })
    };

    // GET /resource/{Recruit}
    public show: HttpDispatch = async ({ request }, {Recruit}) => {
        // Show a single resource by ID
        return response().json({
            message:`show ${Recruit}`
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

    // GET /resource/{Recruit}/edit
    public edit: HttpDispatch = async ({ request }, {Recruit}) => {
        // Return form or data for editing resource
        return response().json({
            message:`edit ${Recruit}`
        })
    };

    // PUT or PATCH /resource/{Recruit}
    public update: HttpDispatch = async ({ request }, {Recruit}) => {
        // Update a resource by ID
        return response().json({
            message:`update ${Recruit}`
        })
    };

    // DELETE /resource/{Recruit}
    public destroy: HttpDispatch = async ({ request }, {Recruit}) => {
        // Delete a resource by ID
        return response().json({
            message:`delete ${Recruit}`
        })
    };
}

export default RecruitController;
