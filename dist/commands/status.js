import chalk from "chalk";
import { requireActiveGame } from "../active.js";
export function statusCommand() {
    const { game } = requireActiveGame();
    const done = game.trophies.filter((t) => t.done).length;
    const total = game.trophies.length;
    const missablesPending = game.trophies.filter((t) => t.missable && !t.done);
    console.log(chalk.bold(game.name) + chalk.gray(` [${game.mode}]`));
    console.log(`Progress: ${chalk.green(String(done))}/${total} trophies`);
    if (missablesPending.length > 0) {
        console.log(chalk.yellow(`\n⚠ Missable trophies remaining: ${missablesPending.length}`));
        missablesPending.forEach((t) => console.log(chalk.yellow(`  - ${t.name}`)));
    }
    if (game.notes) {
        console.log(chalk.gray(`\nNotes: ${game.notes}`));
    }
}
