import { Route } from "Illuminate/Support/Facades/index.ts";

// if group param is string then it will use the groupRoutingAlias in bootstrap/app.ts
Route.prefix("/pecu").group("pecu");
