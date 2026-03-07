import Anthropic from "@anthropic-ai/sdk";
import { readConfig } from "./config.js";
import { readGame, writeGame } from "./game.js";
import { buildSystemPrompt } from "./prompt.js";
import type { Message } from "./types.js";
import chalk from "chalk";
import ora from "ora";

const MAX_HISTORY = 20; // 10 exchanges = 20 messages

export async function chat(
  userMessage: string,
  slug: string,
  correcting = false
): Promise<void> {
  const config = readConfig();
  if (!config.apiKey) {
    console.log(chalk.red("No API key. Run: mimir setup"));
    process.exit(1);
  }

  const game = readGame(slug);
  const client = new Anthropic({ apiKey: config.apiKey });
  const systemPrompt = buildSystemPrompt(game);

  const messages: Message[] = [...game.history];

  if (correcting && messages.length >= 2) {
    const lastUserMsg = messages.findLast((m: Message) => m.role === "user");
    if (lastUserMsg) {
      messages.push({
        role: "user",
        content:
          "That answer was incorrect or didn't work. Please approach this differently: " +
          lastUserMsg.content,
      });
    }
  } else {
    messages.push({ role: "user", content: userMessage });
  }

  const spinner = ora("Thinking...").start();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  spinner.stop();

  const reply = response.content[0].type === "text" ? response.content[0].text : "";
  console.log("\n" + reply + "\n");

  game.history = (
    [...messages, { role: "assistant" as const, content: reply }]
  ).slice(-MAX_HISTORY);

  writeGame(game);
}
