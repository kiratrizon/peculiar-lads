import { Route } from "Illuminate/Support/Facades/index.ts";

import KeepAliveController from "App/Http/Controllers/KeepAliveController.ts";

Route.get("/", async ({ request }) => {
  return response().json({ message: "API is working!" });
});

Route.group({ middleware: ["is_admin_api"] }, () => {
  Route.post("/keep-alive", [KeepAliveController, "index"]).name("keep-alive");
});
