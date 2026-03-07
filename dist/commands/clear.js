import chalk from "chalk";
import { requireActiveGame } from "../active.js";
import { writeGame } from "../game.js";
export function clearCommand() {
    const { game } = requireActiveGame();
    game.history = [];
    writeGame(game);
    console.log(chalk.green("Conversation history cleared."));
}
