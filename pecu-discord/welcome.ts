import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { GuildMember, PartialGuildMember } from "discord.js";

type Member = GuildMember | PartialGuildMember;

const pecuAssetsPath = (concatenation = "") => {
  return basePath(
    concatenation
      ? `pecu-discord/assets/${concatenation}`
      : "pecu-discord/assets",
  );
};

const iconFiles = Array.from(Deno.readDirSync(pecuAssetsPath())).filter(
  (file) => file.isFile && file.name.endsWith(".png"),
);

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
    file.name.toLowerCase().includes(variant)
  );
  return pecuAssetsPath((match ?? iconFiles[0]).name);
};

const paletteFor = (variant: string): Palette =>
  palettes[variant] ?? defaultPalette;

const buildMemberCard = async (member: Member, label: string) => {
  const variant = "ice";
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

  const avatarUrl = member.displayAvatarURL({ extension: "png", size: 256 });
  const avatarBuffer = new Uint8Array(
    await (await fetch(avatarUrl)).arrayBuffer(),
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

  const text = `${label}, ${member.user.username}!`;
  const maxTextWidth = canvas.width * 0.86;

  ctx.textAlign = "center";
  ctx.fillStyle = palette.text;
  let fontSize = Math.round(canvas.height * 0.045);
  do {
    ctx.font = `bold ${fontSize}px sans-serif`;
    fontSize -= 2;
  } while (ctx.measureText(text).width > maxTextWidth && fontSize > 10);

  const textY = canvas.height * 0.88;

  // Dark outline keeps the text legible on both light and dark Discord themes.
  ctx.lineWidth = Math.max(2, fontSize * 0.12);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
  ctx.strokeText(text, canvas.width / 2, textY);
  ctx.fillText(text, canvas.width / 2, textY);

  return canvas.toBuffer("image/png");
};

export const buildWelcomeImage = (member: Member) =>
  buildMemberCard(member, "Welcome");

export const buildByeImage = (member: Member) => buildMemberCard(member, "Bye");
