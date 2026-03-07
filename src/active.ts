import chalk from "chalk";
import { readConfig } from "./config.js";
import { readGame } from "./game.js";
import type { Game } from "./types.js";

export function requireActiveGame(): { slug: string; game: Game } {
  const config = readConfig();
  if (!config.activeGame) {
    console.log(chalk.red("No active game. Run: mimir use <name>"));
    process.exit(1);
  }
  const game = readGame(config.activeGame);
  return { slug: config.activeGame, game };
}
