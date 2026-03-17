import Controller from "App/Http/Controllers/Controller.ts";

class ThirdClassController extends Controller {
    // create function like this
    public index: HttpDispatch = async ({request}) => {
        // your logic here
        return "test"
    }
}

export default ThirdClassController;