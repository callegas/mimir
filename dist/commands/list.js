import chalk from "chalk";
import { requireActiveGame } from "../active.js";
export function listCommand(options) {
    const { game } = requireActiveGame();
    let trophies = game.trophies;
    if (options.dlc) {
        trophies = trophies.filter((t) => t.dlc?.toLowerCase().includes(options.dlc.toLowerCase()));
    }
    const pending = trophies.filter((t) => !t.done);
    const done = trophies.filter((t) => t.done);
    if (pending.length > 0) {
        console.log(chalk.bold("\nPending:"));
        pending.forEach((t) => {
            const missable = t.missable ? chalk.yellow(" [missable]") : "";
            const dlc = t.dlc ? chalk.gray(` (${t.dlc})`) : "";
            console.log(`  [ ] ${t.name}${missable}${dlc}`);
        });
    }
    if (done.length > 0) {
        console.log(chalk.bold("\nDone:"));
        done.forEach((t) => console.log(chalk.gray(`  [x] ${t.name}`)));
    }
}
