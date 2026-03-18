import BaseController from "Illuminate/Routing/BaseController";
import HonoRequest from "HonoHttp/HonoRequest.d.ts";
import { Cache } from "Illuminate/Support/Facades/index.ts";
import Admin from "../../Models/Admin.ts";

class Controller extends BaseController {
  // You can add common methods or properties for all controllers here
  protected async getUnreads({ request }: { request: HonoRequest }): Promise<{
    recruits: number[],
    events: number[],
  }> {
    const entity = request.user() instanceof Admin ? "admin" : "user";
    // @ts-ignore //
    const userId = request.user()?.id!;
    const stats: {
      recruits: number[],
      events: number[],
    } = (await Cache.get(`${entity}.${userId}.unreads`)) || {
      recruits: [],
      events: [],
    };
    return stats;
  }
}

export default Controller;
