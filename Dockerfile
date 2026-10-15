FROM denoland/deno:2.7.11

WORKDIR /app

COPY . .

RUN deno install --entrypoint pecu-discord-deno/server.ts

CMD ["deno", "task", "discord"]
