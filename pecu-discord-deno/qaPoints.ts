import QaPoint from "App/Models/QaPoint.ts";
import { buildLevelUpImage } from "./welcome.ts";
import { logErrorToDiscord } from "./errorLog.ts";
import type { AppBot, AppMessage } from "./types.ts";

// 5 points per level, starting at level 1 - change POINTS_PER_LEVEL to retune.
const POINTS_PER_LEVEL = 5;
const MIN_ANSWER_LENGTH = 10;

export const levelForPoints = (points: number): number =>
  Math.floor(points / POINTS_PER_LEVEL) + 1;

// Level-gated role rewards - stack, don't swap (a level-30 member keeps the
// level-5 and level-15 roles too). Looked up by name on every level-up
// (no ID caching - a renamed/deleted role would leave a stale, invalid ID
// behind), created on demand, so no role IDs need to be pre-configured in .env.
const LEVEL_ROLES: { level: number; name: string; color: number }[] = [
  { level: 5, name: "QA Contributor", color: 0x8b5cf6 },
  { level: 15, name: "QA Regular", color: 0x3b82f6 },
  { level: 30, name: "QA Expert", color: 0xf59e0b },
];

const ensureLevelRole = async (
  bot: AppBot,
  guildId: bigint,
  tier: { name: string; color: number },
): Promise<bigint> => {
  const roles = await bot.helpers.getRoles(guildId);
  const existing = roles.find((role) => role.name === tier.name);
  if (existing) return existing.id;

  const created = await bot.helpers.createRole(
    guildId,
    { name: tier.name, color: tier.color, hoist: true, mentionable: true },
    "QA leveling reward tier",
  );
  return created.id;
};

const grantLevelRoles = async (
  bot: AppBot,
  guildId: bigint,
  userId: bigint,
  previousLevel: number,
  newLevel: number,
): Promise<void> => {
  for (const tier of LEVEL_ROLES) {
    if (tier.level <= previousLevel || tier.level > newLevel) continue;
    try {
      const roleId = await ensureLevelRole(bot, guildId, tier);
      await bot.helpers.addRole(guildId, userId, roleId, "QA leveling reward");
    } catch (e) {
      console.error(`Failed to grant QA level role "${tier.name}"`, e);
      logErrorToDiscord(`qaPoints: grant role ${tier.name}`, e);
    }
  }
};

// Called on every message in the QA channel. A message counts as an "answer"
// (and earns its author a point) when it's a reply to a message containing a
// "?" and its own text is at least MIN_ANSWER_LENGTH chars - short replies
// like "yes"/"same" don't count, and answering your own question doesn't
// either.
export const handleQaMessage = async (
  bot: AppBot,
  message: AppMessage,
): Promise<void> => {
  if (message.author.bot) return;

  const original = message.referencedMessage;
  if (!original) return;
  if (!original.content?.includes("?")) return;
  if (original.author.id === message.author.id) return;

  const answerText = message.content?.trim() ?? "";
  if (answerText.length < MIN_ANSWER_LENGTH) return;

  const discordId = message.author.id.toString();
  const username = message.author.username;

  const account = await QaPoint.where("discord_id", discordId).first();

  // @ts-ignore //
  const previousLevel = account ? (account.level as number) : 1;
  // @ts-ignore //
  const newPoints = (account ? (account.points as number) : 0) + 1;
  const newLevel = levelForPoints(newPoints);

  if (account) {
    account.fill({ username, points: newPoints, level: newLevel });
    await account.save();
  } else {
    await QaPoint.create({
      discord_id: discordId,
      username,
      points: newPoints,
      level: newLevel,
    });
  }

  if (newLevel > previousLevel) {
    const image = await buildLevelUpImage(
      {
        id: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator,
        avatar: message.author.avatar,
      },
      newLevel,
    );

    await bot.helpers.sendMessage(message.channelId, {
      content: `🎉 <@${discordId}> leveled up to **Level ${newLevel}**!`,
      files: [
        {
          blob: new Blob([new Uint8Array(image)], { type: "image/png" }),
          name: "level-up.png",
        },
      ],
    });

    if (message.guildId) {
      await grantLevelRoles(
        bot,
        message.guildId,
        message.author.id,
        previousLevel,
        newLevel,
      );
    }
  }
};
