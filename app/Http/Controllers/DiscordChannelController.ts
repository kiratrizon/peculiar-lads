import Controller from "App/Http/Controllers/Controller.ts";
import DiscordChannel from "App/Models/DiscordChannel.ts";
import AdminChannelOrder from "App/Models/AdminChannelOrder.ts";
import { ChannelTypes } from "@discordeno/bot";
import { bot } from "../../../pecu-discord-deno/main.ts";

class DiscordChannelController extends Controller {
  public index: HttpDispatch = async ({ request }) => {
    const channels = await DiscordChannel.all();
    // @ts-ignore //
    const adminId = request.user()?.id as number;

    const orders = await AdminChannelOrder.where("admin_id", adminId).get();
    const positionByChannelRowId = new Map<number, number>();
    for (const order of orders) {
      // @ts-ignore //
      const orderedChannelRowId = order.discord_channel_id as number;
      // @ts-ignore //
      const orderedPosition = order.position as number;
      positionByChannelRowId.set(orderedChannelRowId, orderedPosition);
    }

    const sortedChannels = [...channels].sort((a, b) => {
      // @ts-ignore //
      const posA = positionByChannelRowId.get(a.id as number) ??
        Number.MAX_SAFE_INTEGER;
      // @ts-ignore //
      const posB = positionByChannelRowId.get(b.id as number) ??
        Number.MAX_SAFE_INTEGER;
      return posA - posB;
    });

    return view("admin.schedule.channels", {
      selected: "schedule",
      entity: "Admin",
      title: "Scheduled Messages",
      channels: sortedChannels,
    });
  };

  public store: HttpDispatch = async ({ request }) => {
    const data = await request.validate({
      channel_id: "required",
      name: "required",
    });

    const existing = await DiscordChannel.where(
      "channel_id",
      data.channel_id,
    ).first();

    if (existing) {
      return redirect()
        .route("admin.schedule.channels")
        .withErrors({ channel_id: "That channel is already added." })
        .withInput(request.all());
    }

    await DiscordChannel.create({
      channel_id: data.channel_id,
      guild_id: (env("DISCORD_GUILD_ID") as string | null) ?? "",
      name: data.name,
    });

    return redirect()
      .route("admin.schedule.channels")
      .with("message", "Channel added.");
  };

  public reorder: HttpDispatch = async ({ request }) => {
    const channelIds = request.input("channel_ids");

    if (!Array.isArray(channelIds)) {
      return response().json({ message: "channel_ids must be an array." }, 422);
    }

    // @ts-ignore //
    const adminId = request.user()?.id as number;

    await Promise.all(
      channelIds.map(async (channelId: string, position: number) => {
        const channel = await DiscordChannel.where(
          "channel_id",
          String(channelId),
        ).first();
        if (!channel) return;
        // @ts-ignore //
        const channelRowId = channel.id as number;

        const existingOrder = await AdminChannelOrder.where(
          "admin_id",
          adminId,
        )
          .where("discord_channel_id", channelRowId)
          .first();

        if (existingOrder) {
          existingOrder.fill({ position });
          await existingOrder.save();
        } else {
          await AdminChannelOrder.create({
            admin_id: adminId,
            discord_channel_id: channelRowId,
            position,
          });
        }
      }),
    );

    return response().json({ message: "Order saved." });
  };

  public destroy: HttpDispatch = async (
    { request },
    { discord_channel_id },
  ) => {
    // Deletes any scheduled_messages for this channel too, via the
    // migration's onDelete("cascade") foreign key.
    await DiscordChannel.query()
      .where("channel_id", discord_channel_id)
      .delete();

    return redirect()
      .route("admin.schedule.channels")
      .with("message", "Channel removed.");
  };

  public sync: HttpDispatch = async ({ request }) => {
    const guildId = env("DISCORD_GUILD_ID") as string | null;

    if (!guildId) {
      return redirect()
        .route("admin.schedule.channels")
        .withErrors({ sync: "DISCORD_GUILD_ID is not configured in .env." });
    }

    const discordChannels = await bot.helpers.getChannels(guildId);

    for (const channel of discordChannels) {
      if (
        channel.type !== ChannelTypes.GuildText &&
        channel.type !== ChannelTypes.GuildAnnouncement
      ) {
        continue;
      }

      const attributes = {
        channel_id: channel.id.toString(),
        guild_id: guildId,
        name: channel.name ?? channel.id.toString(),
      };

      const existing = await DiscordChannel.where(
        "channel_id",
        attributes.channel_id,
      ).first();

      if (existing) {
        existing.fill(attributes);
        await existing.save();
      } else {
        await DiscordChannel.create(attributes);
      }
    }

    return redirect()
      .route("admin.schedule.channels")
      .with("message", "Channels synced from Discord.");
  };
}

export default DiscordChannelController;
