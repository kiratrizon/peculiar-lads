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
    af: "Afrikaans",
    am: "አማርኛ",
    ar: "العربية",
    az: "Azərbaycan",
    bg: "Български",
    bn: "বাংলা",
    ca: "Català",
    cs: "Čeština",
    cy: "Cymraeg",
    da: "Dansk",
    de: "Deutsch",
    el: "Ελληνικά",
    en: "English",
    es: "Español",
    et: "Eesti",
    eu: "Euskara",
    fa: "فارسی",
    fi: "Suomi",
    fil: "Filipino",
    fr: "Français",
    ga: "Gaeilge",
    gl: "Galego",
    gu: "ગુજરાતી",
    ha: "Hausa",
    he: "עברית",
    hi: "हिन्दी",
    hr: "Hrvatski",
    hu: "Magyar",
    hy: "Հայերեն",
    id: "Bahasa Indonesia",
    is: "Íslenska",
    it: "Italiano",
    ja: "日本語",
    ka: "ქართული",
    kk: "Қазақша",
    km: "ខ្មែរ",
    kn: "ಕನ್ನಡ",
    ko: "한국어",
    lo: "ລາວ",
    lt: "Lietuvių",
    lv: "Latviešu",
    mk: "Македонски",
    ml: "മലയാളം",
    mn: "Монгол",
    mr: "मराठी",
    ms: "Bahasa Melayu",
    mt: "Malti",
    my: "မြန်မာ",
    ne: "नेपाली",
    nl: "Nederlands",
    no: "Norsk",
    pa: "ਪੰਜਾਬੀ",
    pl: "Polski",
    pt: "Português",
    ro: "Română",
    ru: "Русский",
    si: "සිංහල",
    sk: "Slovenčina",
    sl: "Slovenščina",
    sq: "Shqip",
    sr: "Српски",
    sv: "Svenska",
    sw: "Kiswahili",
    ta: "தமிழ்",
    te: "తెలుగు",
    th: "ไทย",
    tr: "Türkçe",
    uk: "Українська",
    ur: "اردو",
    uz: "Oʻzbek",
    vi: "Tiếng Việt",
    xh: "isiXhosa",
    yo: "Yorùbá",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    zu: "isiZulu",
  };
}

export default Controller;
