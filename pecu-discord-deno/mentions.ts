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
