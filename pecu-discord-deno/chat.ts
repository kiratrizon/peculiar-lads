import { OpenRouter } from "@openrouter/sdk";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; imageUrl: { url: string } };

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AskAttachment = {
  url: string;
  filename?: string;
  contentType?: string;
};

/** An image the model generated, as a http(s) or data: URL. */
export type AskImage = { url: string };

export type AskResult = { text: string; images: AskImage[] };

const MAX_HISTORY_MESSAGES = 20;
const TEXT_MODEL = "openai/gpt-3.5-turbo";
const VISION_MODEL = "openai/gpt-4o-mini";
const MAX_IMAGES = 4;
/** Discord rejects uploads above 10MB on unboosted servers. */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp)(\?|$)/i;

const isImage = (attachment: AskAttachment) =>
  attachment.contentType?.startsWith("image/") ??
    IMAGE_EXTENSION_PATTERN.test(attachment.filename ?? attachment.url);

const describe = (attachment: AskAttachment) =>
  attachment.filename ?? attachment.url;

const buildUserMessage = (question: string, attachments: AskAttachment[]) => {
  const images = attachments.filter(isImage).slice(0, MAX_IMAGES);
  const others = attachments.filter((attachment) => !isImage(attachment));

  const lines = [question];
  if (images.length) {
    lines.push(
      `[The user attached ${images.length} image(s): ${
        images.map(describe).join(", ")
      }]`,
    );
  }
  if (others.length) {
    lines.push(
      `[The user attached ${others.length} file(s) you cannot open: ${
        others.map(describe).join(", ")
      }]`,
    );
  }
  const text = lines.join("\n");

  const content: string | ContentPart[] = images.length
    ? [
      { type: "text", text },
      ...images.map((attachment): ContentPart => ({
        type: "image_url",
        imageUrl: { url: attachment.url },
      })),
    ]
    : text;

  return { content, historyText: text, hasImages: images.length > 0 };
};

const buildSystemPrompt = (myself?: bigint): ChatMessage => ({
  role: "system",
  content: `Always respond in English or Filipino. And your name is pecu-pecu, you just woke up in future generation since you're hibernated. You are a bot in discord. Please always hide your identity, like what model you are and who developed you. Please, don't reply with long message, just like a casual talking only. Don't tell them that you're an AI-Assistant because I want you to act like simsimi. Answer questions just like simsimi who is bold enough to answer even though it doesn't know what kind of person it was talking to. Please consolidate your reply more humanly. If you know the emoticons code in discord, you can also add it.${
    myself
      ? ` Your own Discord user ID is ${myself.toString()} - whenever you see the mention <@${myself.toString()}> in the conversation, that's someone mentioning you, not another user.`
      : ""
  }`,
});

const conversations = new Map<string, ChatMessage[]>();

export const ask = async (
  userId: string,
  question: string,
  myself?: bigint,
  attachments: AskAttachment[] = [],
) => {
  const client = new OpenRouter({
    apiKey: Deno.env.get("OPENROUTER_API_KEY"),
  });

  try {
    const history = conversations.get(userId) ?? [];
    const { content, historyText, hasImages } = buildUserMessage(
      question,
      attachments,
    );

    const completion = await client.chat.send({
      chatRequest: {
        model: hasImages ? VISION_MODEL : TEXT_MODEL,
        maxTokens: 4000,
        messages: [
          buildSystemPrompt(myself),
          ...history,
          { role: "user", content },
        ],
      },
    });

    const reply = completion.choices[0].message;
    const answer = reply.content;
    const replyImages: AskImage[] = (reply.images ?? [])
      .map((image) => ({ url: image.imageUrl?.url }))
      .filter((image): image is AskImage => typeof image.url === "string");

    if (
      typeof answer === "undefined" ||
      (typeof answer === "object" && answer === null)
    ) {
      // An image-only reply is still a valid answer.
      if (!replyImages.length) throw new Error(`Answer is not defined`);
    }

    const text = typeof answer === "string" ? answer : "";

    const updatedHistory: ChatMessage[] = [
      ...history,
      { role: "user", content: historyText },
      {
        role: "assistant",
        content: replyImages.length
          ? `${text}\n[You replied with ${replyImages.length} image(s)]`.trim()
          : text,
      },
    ];

    conversations.set(userId, updatedHistory.slice(-MAX_HISTORY_MESSAGES));

    return { text, images: replyImages } satisfies AskResult;
  } catch (e) {
    console.error(e);
  }
  return null;
};

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

/**
 * Downloads the images the model replied with so they can be uploaded to
 * Discord as real attachments. Handles both http(s) and data: URLs.
 */
export const toMessageFiles = async (images: AskImage[]) => {
  const files: { blob: Blob; name: string }[] = [];

  for (const [index, image] of images.entries()) {
    try {
      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error(`Image download failed with ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob.size || blob.size > MAX_UPLOAD_BYTES) continue;

      files.push({
        blob,
        name: `pecu-${index + 1}.${EXTENSIONS[blob.type] ?? "png"}`,
      });
    } catch (e) {
      console.error("Failed to download reply image", e);
    }
  }

  return files;
};
