export default class SetupLangVar {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // Implement logic here
    const languageConversion: Record<string, string> = {
      en: "English",
      fil: "Filipino",
      ko: "한국어",
      id: "Bahasa Indonesia",
      ja: "日本語",
      es: "Español",
      fr: "Français",
      th: "ไทย",
      vi: "Tiếng Việt",
      "zh-CN": "简体中文",
      "zh-TW": "繁體中文",
    };
    request.set("languageConversion", languageConversion);
    return next();
  };
}
