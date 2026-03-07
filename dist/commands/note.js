import chalk from "chalk";
import { requireActiveGame } from "../active.js";
import { writeGame } from "../game.js";
export function noteCommand(text) {
    const { game } = requireActiveGame();
    game.notes = text;
    writeGame(game);
    console.log(chalk.green("Notes updated."));
}
