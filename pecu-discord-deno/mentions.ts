// Scheduled message content stores role mentions as a `{{role:ID:Label}}`
// macro rather than the raw `<@&ID>` Discord syntax, so the admin composer
// can keep showing a human-readable label even if the role gets renamed
// later. `renderMentions` swaps the macro for the real mention syntax right
// before sending; `extractRoleMentionIds` collects which role ids are
// actually referenced so the send call can allow-list exactly those roles
// (and no others) via `allowedMentions.roles`.
const ROLE_MENTION_PATTERN = /\{\{role:(\d+):[^}]*\}\}/g;

export const extractRoleMentionIds = (content: string): bigint[] => {
  const ids = new Set<string>();
  for (const match of content.matchAll(ROLE_MENTION_PATTERN)) {
    ids.add(match[1]);
  }
  return [...ids].map((id) => BigInt(id));
};

export const renderMentions = (content: string): string =>
  content.replace(ROLE_MENTION_PATTERN, (_match, roleId: string) => `<@&${roleId}>`);

// Discord hard-caps a single message's content at 2000 chars. Splits on
// paragraph breaks (never mid-sentence/mid-list) so a long scheduled
// announcement sends as several messages instead of erroring outright.
const DISCORD_MESSAGE_MAX_LENGTH = 2000;

export const splitMessage = (
  content: string,
  maxLength = DISCORD_MESSAGE_MAX_LENGTH,
): string[] => {
  if (content.length <= maxLength) return [content];

  const chunks: string[] = [];
  let current = "";

  for (const block of content.split("\n\n")) {
    const candidate = current ? `${current}\n\n${block}` : block;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current);

    if (block.length <= maxLength) {
      current = block;
    } else {
      // A single paragraph is itself too long (rare) - hard-slice it.
      for (let i = 0; i < block.length; i += maxLength) {
        chunks.push(block.slice(i, i + maxLength));
      }
      current = "";
    }
  }

  if (current) chunks.push(current);
  return chunks;
};
