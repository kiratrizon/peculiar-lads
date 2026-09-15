const discordApp = async () => {
  await import("pecu-discord-deno/main.ts");
};

if (config("app.env") == "production") {
  await discordApp();
}
