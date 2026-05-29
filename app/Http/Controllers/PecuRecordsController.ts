import Controller from "App/Http/Controllers/Controller.ts";

class PecuRecordsController extends Controller {
    // create function like this
    public index: HttpDispatch = async ({request}) => {
        
        return view('guest.records');
    }
}

export default PecuRecordsController;