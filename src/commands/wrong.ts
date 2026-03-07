import chalk from "chalk";
import { requireActiveGame } from "../active.js";
import { chat } from "../ai.js";

export async function wrongCommand(): Promise<void> {
  const { slug, game } = requireActiveGame();
  if (game.history.length === 0) {
    console.log(chalk.yellow("No previous answer to correct."));
    return;
  }
  await chat("", slug, true);
}
