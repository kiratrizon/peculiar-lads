import BaseController from "Illuminate/Routing/BaseController";
import HonoRequest from "HonoHttp/HonoRequest.d.ts";
import { Cache } from "Illuminate/Support/Facades/index.ts";
import Admin from "../../Models/Admin.ts";

class Controller extends BaseController {
  // You can add common methods or properties for all controllers here
  protected async getUnreads({ request }: { request: HonoRequest }): Promise<{
    recruits: number[];
    events: number[];
  }> {
    const entity = request.user() instanceof Admin ? "admin" : "user";
    // @ts-ignore //
    const userId = request.user()?.id!;
    const stats: {
      recruits: number[];
      events: number[];
    } = (await Cache.get(`${entity}.${userId}.unreads`)) || {
      recruits: [],
      events: [],
    };
    return stats;
  }

  protected languageConversion: Record<string, string> = {
    en: "English",
    es: "Español",
    ja: "日本語",
    ko: "한국어",
    id: "Bahasa Indonesia",
    vi: "Tiếng Việt",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    fil: "Filipino",
    fr: "Français",
    th: "ไทย",
  };
}

export default Controller;
