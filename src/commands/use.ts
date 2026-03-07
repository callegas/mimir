import Fuse from "fuse.js";
import chalk from "chalk";
import ora from "ora";
import Anthropic from "@anthropic-ai/sdk";
import { readConfig, writeConfig } from "../config.js";
import { listGames, readGame, writeGame, gameSlug } from "../game.js";
import type { Game, Trophy } from "../types.js";

export function parseTrophyList(raw: string): Trophy[] {
  // strip markdown code block if present
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Expected a JSON array of trophies");
  return parsed as Trophy[];
}

async function generateTrophyList(gameName: string, apiKey: string): Promise<Trophy[]> {
  const client = new Anthropic({ apiKey });

  const spinner = ora(`Fetching trophy list for ${gameName}...`).start();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `List all PS4/PS5 trophies for the game "${gameName}".
For each trophy output a JSON object with these exact fields:
- id: kebab-case string identifier
- name: trophy name string
- description: how to unlock it (one sentence)
- dlc: null if base game, or the DLC name string
- missable: true if the trophy can be permanently locked out, false otherwise
- done: false

Output ONLY a valid JSON array. No explanation, no markdown, no other text.`,
      },
    ],
  });

  spinner.stop();

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  return parseTrophyList(raw);
}

export async function useCommand(name: string): Promise<void> {
  const existing = listGames();

  // fuzzy match against saved games first
  const fuse = new Fuse(existing, { threshold: 0.4 });
  const matches = fuse.search(gameSlug(name));

  let slug: string;

  if (matches.length > 0) {
    slug = matches[0].item;
  } else {
    // generate trophy list via Claude
    const config = readConfig();
    if (!config.apiKey) {
      console.log(chalk.red("No API key. Run: mimir setup"));
      process.exit(1);
    }

    const trophies = await generateTrophyList(name, config.apiKey);

    const game: Game = {
      name,
      mode: "explore",
      trophies,
      notes: "",
      history: [],
    };

    writeGame(game);
    slug = gameSlug(name);
    console.log(chalk.green(`Initialized ${name} with ${trophies.length} trophies.`));

    const missables = trophies.filter((t) => t.missable).length;
    if (missables > 0) {
      console.log(chalk.yellow(`⚠ ${missables} missable trophies — run 'mimir list' to review.`));
    }
  }

  const config = readConfig();
  writeConfig({ ...config, activeGame: slug });

  const game = readGame(slug);
  const done = game.trophies.filter((t) => t.done).length;
  console.log(chalk.cyan(`Active: ${game.name} [${game.mode}] — ${done}/${game.trophies.length} trophies`));
}
