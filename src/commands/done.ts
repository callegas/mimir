import chalk from "chalk";
import { requireActiveGame } from "../active.js";
import { writeGame } from "../game.js";
import { fuzzyFindTrophy } from "../fuzzy.js";

export function doneCommand(name: string, undone = false): void {
  const { game } = requireActiveGame();

  const trophy = fuzzyFindTrophy(name, game.trophies);
  if (!trophy) {
    console.log(chalk.red(`Trophy not found: "${name}"`));
    process.exit(1);
  }

  trophy.done = !undone;
  writeGame(game);

  const status = undone ? chalk.yellow("unmarked") : chalk.green("done");
  console.log(`${trophy.name} → ${status}`);

  const remaining = game.trophies.filter((t) => !t.done).length;
  console.log(chalk.gray(`${remaining} trophies remaining`));
}
