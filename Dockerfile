# Image for the Discord gateway process only - the web app stays on Deno
# Deploy. The gateway holds a long-lived WebSocket, which Deploy's isolates
# can't: they stop when traffic goes quiet and can run several at once, so the
# bot would re-IDENTIFY on every cold start and double up on events.
#
# Entry point is pecu-discord-deno/server.ts (`deno task discord`), which pulls
# in the framework globals and then main.ts.
FROM denoland/deno:2.7.11

WORKDIR /app

COPY . .

# Debian-based image on purpose: the welcome/bye banners use @napi-rs/canvas,
# which resolves to its prebuilt linux-gnu binary here (a musl/alpine base
# would need the -musl build instead).
#
# deno.json sets nodeModulesDir: "auto", so this both populates node_modules
# and warms the remote module graph - a cold container boots straight into
# bot.start() instead of downloading dependencies first.
RUN deno install --entrypoint pecu-discord-deno/server.ts

CMD ["deno", "task", "discord"]
