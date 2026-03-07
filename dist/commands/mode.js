import chalk from "chalk";
import { requireActiveGame } from "../active.js";
import { writeGame } from "../game.js";
export function modeCommand(mode) {
    if (mode !== "explore" && mode !== "platinum") {
        console.log(chalk.red("Mode must be 'explore' or 'platinum'."));
        process.exit(1);
    }
    const { game } = requireActiveGame();
    game.mode = mode;
    writeGame(game);
    console.log(chalk.green(`Mode set to ${chalk.bold(mode)}.`));
}
