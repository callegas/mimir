import chalk from "chalk";
import { readConfig } from "./config.js";
import { readGame } from "./game.js";
export function requireActiveGame() {
    const config = readConfig();
    if (!config.activeGame) {
        console.log(chalk.red("No active game. Run: mimir use <name>"));
        process.exit(1);
    }
    const game = readGame(config.activeGame);
    return { slug: config.activeGame, game };
}
