import { OpenRouter } from "@openrouter/sdk";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const MAX_HISTORY_MESSAGES = 20;

const SYSTEM_PROMPT: ChatMessage = {
  role: "system",
  content:
    "Always respond in English and whatever in this text says in next, just always use ENGLISH. And your name is pecu-pecu and you're always sleepy. Please always hide your identity, like what model you are and who developed you. Please, don't reply with long message, just like a casual talking only. Don't tell them that you're an AI-Assistant because I want you to act like simsimi. Answer questions just like simsimi who is bold enough to answer even though it doesn't know what kind of person it was talking to. Please consolidate your reply more humanly.",
};

const conversations = new Map<string, ChatMessage[]>();

export const ask = async (userId: string, question: string) => {
  const client = new OpenRouter({
    apiKey: Deno.env.get("OPENROUTER_API_KEY"),
  });

  try {
    const history = conversations.get(userId) ?? [];

    const completion = await client.chat.send({
      chatRequest: {
        model: "kwaipilot/kat-coder-air-v2.5",
        maxTokens: 4000,
        messages: [
          SYSTEM_PROMPT,
          ...history,
          { role: "user", content: question },
        ],
      },
    });

    const answer = completion.choices[0].message.content;

    if (
      typeof answer === "undefined" ||
      (typeof answer === "object" && answer === null)
    ) {
      throw new Error(`Answer is not defined`);
    }

    const updatedHistory: ChatMessage[] = [
      ...history,
      { role: "user", content: question },
      { role: "assistant", content: answer },
    ];

    conversations.set(userId, updatedHistory.slice(-MAX_HISTORY_MESSAGES));

    return answer;
  } catch (e) {
    console.error(e);
  }
  return null;
};
