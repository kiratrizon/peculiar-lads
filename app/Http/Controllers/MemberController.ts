import Controller from "App/Http/Controllers/Controller.ts";
import { DB, Validator } from "Illuminate/Support/Facades/index.ts";
import Character from "App/Models/Character.ts";
import User from "App/Models/User.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";

class MemberController extends Controller {
  // GET /resource
  public index: HttpDispatch = async ({ request }) => {
    const notif = await this.getUnreads({ request });

    const [page, perPage] = [
      parseInt((request.query("page") as string) || "1"),
      parseInt((request.query("perPage") as string) || "10"),
    ];
    const searchDiscord = request.query("discord");
    const searchName = request.query("name");

    const urlInstance = new URL(request.url);
    const userQuery = User.query();
    userQuery.select("id", "name", "discord", DB.raw("created_at as joined"));
    userQuery.where("deactivated", false);
    if (isset(searchDiscord)) {
      // validate here
      const discordValidate = await Validator.make(
        { discord: searchDiscord },
        {
          discord: "alpha_num",
        },
      );
      if (!discordValidate.fails()) {
        userQuery.where("discord", "like", `%${searchDiscord}%`);
      }
    }
    if (isset(searchName)) {
      const nameValidate = await Validator.make(
        { name: searchName },
        {
          name: "alpha",
        },
      );
      if (!nameValidate.fails()) {
        userQuery.where("name", "like", `%${searchName}%`);
      }
    }

    const users = await userQuery.paginate(page, perPage, urlInstance);
    return view("shared.members", {
      selected: "members",
      title: "Members",
      notif,
      users,
      searchDiscord,
      searchName,
    });
  };

  // GET /resource/{member}
  public show: HttpDispatch = async ({ request }, { member }) => {
    const notif = await this.getUnreads({ request });

    const [characters, allClass, nstg] = await Promise.all([
      Character.query()
        .select(
          "characters.id",
          "characters.ign",
          "characters.third_class_id",
          "characters.nstg_level_id",
          DB.raw("nstg_level.code as nstg"),
          DB.raw("third_classes.name as class"),
          "characters.main",
          "characters.duration",
        )
        .join("nstg_level", "characters.nstg_level_id", "=", "nstg_level.id")
        .join(
          "third_classes",
          "characters.third_class_id",
          "=",
          "third_classes.id",
        )
        .where("characters.user_id", member.id)
        .orderBy("characters.main", "desc")
        .orderBy("nstg_level.id", "desc")
        .orderBy("characters.duration")
        .get(),
      ThirdClass.all(),
      NSTGLevel.all(),
    ]);

    const schedules = [
      {
        date: "2026-07-05",
        time: "19:00",
        activity: "Raid Training",
        status: "Confirmed",
      },
      {
        date: "2026-07-07",
        time: "21:00",
        activity: "Guild Dungeon",
        status: "Pending",
      },
      {
        date: "2026-07-09",
        time: "18:30",
        activity: "Community Hangout",
        status: "Confirmed",
      },
    ];

    return view("shared.members-show", {
      selected:
        request.get("entity") == "Admin" ||
        (request.get("entity") == "User" && request.user()?.id !== member.id)
          ? "members"
          : "my_characters",
      title: `${member.name} - Member Details`,
      notif,
      user: member,
      characters,
      schedules,
      allClass,
      nstg,
      canEdit:
        request.get("entity") == "Admin" ||
        (request.get("entity") == "User" && request.user()?.id === member.id),
    });
  };

  // GET /resource/create
  public create: HttpDispatch = async ({ request: _request }) => {
    // Return form or data for creating resource
    return response().json({
      message: `create`,
    });
  };

  // POST /resource
  public store: HttpDispatch = async ({ request: _request }) => {
    // Create a new resource
    return response().json({
      message: `store`,
    });
  };

  // GET /resource/{member}/edit
  public edit: HttpDispatch = async ({ request: _request }, { member }) => {
    // Return form or data for editing resource
    return response().json({
      message: `edit ${member}`,
    });
  };

  // PUT or PATCH /resource/{member}
  public update: HttpDispatch = async ({ request: _request }, { member }) => {
    // Update a resource by ID
    return response().json({
      message: `update ${member}`,
    });
  };

  // DELETE /resource/{member}
  public destroy: HttpDispatch = async ({ request: _request }, { member }) => {
    // Delete a resource by ID
    return response().json({
      message: `delete ${member}`,
    });
  };
}

export default MemberController;
