import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { avatarUrl, memberAvatarUrl } from "@discordeno/bot";
import type { AppMember, AppUser } from "./types.ts";

// A minimal shape covering everything buildMemberCard needs, so the same
// drawing logic can serve the guildMemberRemove (User only) event and the
// REST-fetched member behind the Code of Ethics welcome (welcomeMessage.ts).
//
// avatar/guildAvatar accept a string as well as a bigint: the gateway hands
// over transformed bigint hashes, the REST API plain hash strings, and
// discordeno's avatarUrl/memberAvatarUrl take either (BigString).
type Subject = {
  id: bigint;
  username: string;
  discriminator: string;
  avatar?: bigint | string;
  guildId?: bigint;
  guildAvatar?: bigint | string;
};

const pecuAssetsPath = (concatenation = "") => {
  return basePath(
    concatenation
      ? `pecu-discord-deno/assets/${concatenation}`
      : "pecu-discord-deno/assets",
  );
};

const readDirOrEmpty = (path: string) => {
  try {
    return Array.from(Deno.readDirSync(path));
  } catch {
    return [];
  }
};

const iconFiles = readDirOrEmpty(pecuAssetsPath()).filter(
  (file) => file.isFile && file.name.endsWith(".png"),
);

const CARD_FONT_FAMILY = "PecuCard";

const fontFiles = readDirOrEmpty(pecuAssetsPath("fonts")).filter(
  (file) => file.isFile && /\.(ttf|otf)$/i.test(file.name),
);

for (const file of fontFiles) {
  GlobalFonts.registerFromPath(
    pecuAssetsPath(`fonts/${file.name}`),
    CARD_FONT_FAMILY,
  );
}

// Falls back to the system font stack if no font file is bundled.
const cardFont = fontFiles.length ? `"${CARD_FONT_FAMILY}"` : "sans-serif";

type Palette = { text: string; ring: string };

const palettes: Record<string, Palette> = {
  dark: { text: "#F5E9DA", ring: "#D9A066" },
  fire: { text: "#FFF3E9", ring: "#F3B391" },
  ice: { text: "#EAF6FF", ring: "#8FD3F4" },
  light: { text: "#3B2A20", ring: "#8C5A3C" },
};

const defaultPalette: Palette = { text: "#ffffff", ring: "#ffffff" };

const pickByVariant = (variant: string) => {
  const match = iconFiles.find((file) =>
    file.name.toLowerCase().includes(variant),
  );
  return pecuAssetsPath((match ?? iconFiles[0]).name);
};

const paletteFor = (variant: string): Palette =>
  palettes[variant] ?? defaultPalette;

const resolveAvatarUrl = (subject: Subject): string => {
  if (subject.guildId && subject.guildAvatar) {
    const url = memberAvatarUrl(subject.guildId, subject.id, {
      avatar: subject.guildAvatar,
      size: 256,
      format: "png",
    });
    if (url) return url;
  }

  return avatarUrl(subject.id, subject.discriminator, {
    avatar: subject.avatar,
    size: 256,
    format: "png",
  });
};

const buildMemberCard = async (
  subject: Subject,
  text: string,
  variant = "ice",
) => {
  const palette = paletteFor(variant);
  const icon = await loadImage(pickByVariant(variant));

  const canvas = createCanvas(icon.width, icon.height);
  const ctx = canvas.getContext("2d");

  // Icon fills the whole canvas as the background, avatar sits on top of it.
  ctx.drawImage(icon, 0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;

  // Avatar sits over the icon's crest, leaving its wordmark visible beneath.
  const avatarSize = Math.round(canvas.height * 0.29);
  const centerY = canvas.height * 0.27;
  const avatarX = centerX - avatarSize / 2;
  const avatarY = centerY - avatarSize / 2;

  const avatarLink = resolveAvatarUrl(subject);
  const avatarBuffer = new Uint8Array(
    await (await fetch(avatarLink)).arrayBuffer(),
  );
  const avatar = await loadImage(avatarBuffer);

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  ctx.lineWidth = Math.max(4, avatarSize * 0.03);
  ctx.strokeStyle = palette.ring;
  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  const maxTextWidth = canvas.width * 0.86;

  ctx.textAlign = "center";
  ctx.fillStyle = palette.text;
  let fontSize = Math.round(canvas.height * 0.045);
  ctx.font = `bold ${fontSize}px ${cardFont}`;
  while (ctx.measureText(text).width > maxTextWidth && fontSize > 10) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px ${cardFont}`;
  }

  const textY = canvas.height * 0.88;

  // Dark outline keeps the text legible on both light and dark Discord themes.
  ctx.lineWidth = Math.max(2, fontSize * 0.12);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
  ctx.strokeText(text, canvas.width / 2, textY);
  ctx.fillText(text, canvas.width / 2, textY);

  return canvas.toBuffer("image/png");
};

export const buildWelcomeCard = (subject: Subject) =>
  buildMemberCard(subject, `Welcome, ${subject.username}!`);

export const buildWelcomeImage = (member: AppMember) =>
  buildWelcomeCard({
    id: member.id,
    username: member.user?.username ?? member.nick ?? "there",
    discriminator: member.user?.discriminator ?? "0",
    avatar: member.user?.avatar,
    guildId: member.guildId,
    guildAvatar: member.avatar,
  });

export const buildByeImage = (user: AppUser) =>
  buildMemberCard(
    {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
    },
    `Bye, ${user.username}!`,
  );

export const buildLevelUpImage = (
  author: {
    id: bigint;
    username: string;
    discriminator: string;
    avatar?: bigint;
  },
  level: number,
) =>
  buildMemberCard(
    {
      id: author.id,
      username: author.username,
      discriminator: author.discriminator,
      avatar: author.avatar,
    },
    `${author.username} reached Level ${level}!`,
    "light",
  );
