import fs from "fs";
import chalk from "chalk";
import { writeGame, gameSlug } from "../game.js";
import { writeConfig, readConfig } from "../config.js";
export function importCommand(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`File not found: ${filePath}`));
        process.exit(1);
    }
    const game = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (!game.name || !Array.isArray(game.trophies)) {
        console.log(chalk.red("Invalid game file. Must have 'name' and 'trophies' fields."));
        process.exit(1);
    }
    game.mode ??= "explore";
    game.notes ??= "";
    game.history ??= [];
    writeGame(game);
    const config = readConfig();
    writeConfig({ ...config, activeGame: gameSlug(game.name) });
    console.log(chalk.green(`Imported ${game.name} (${game.trophies.length} trophies) and set as active.`));
}
