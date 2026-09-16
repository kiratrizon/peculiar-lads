// The Discord bot no longer boots from here. It's a long-lived WebSocket
// process, which Deploy's isolates can't hold: the app is stopped when traffic
// goes quiet and restarted on the next request, so every cold start
// re-IDENTIFYs, and two live instances mean two bots handling the same
// guildMemberAdd/messageCreate.
//
// It runs on its own always-on host instead - `deno task discord`
// (pecu-discord-deno/server.ts), see Dockerfile/fly.toml - and that host also
// owns the scheduled-messages cron, which pings /api/keep-alive here.
