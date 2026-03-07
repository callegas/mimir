import chalk from "chalk";
import { requireActiveGame } from "../active.js";
import { writeGame } from "../game.js";
import type { GameMode } from "../types.js";

export function modeCommand(mode: string): void {
  if (mode !== "explore" && mode !== "platinum") {
    console.log(chalk.red("Mode must be 'explore' or 'platinum'."));
    process.exit(1);
  }

  const { game } = requireActiveGame();
  game.mode = mode as GameMode;
  writeGame(game);
  console.log(chalk.green(`Mode set to ${chalk.bold(mode)}.`));
}
