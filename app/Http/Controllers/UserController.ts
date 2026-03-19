import Controller from "App/Http/Controllers/Controller.ts";
import Recruit from "../../Models/Recruit.ts";

class UserController extends Controller {
    // create function like this
    public index: HttpDispatch = async ({ request }) => {
        // your logic here
    }

    public signup: HttpDispatch = async ({ request }, { inviteLink }) => {
        // your logic here

        // verify the invite link
        const recruit = await Recruit.where("invitation_link", inviteLink).first();
        if (!recruit) {
            console.log("not found");
            return redirect().to("/");
        }

        return view("user.signup", {
            inviteLink
        });
    }
}

export default UserController;