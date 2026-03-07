import * as readline from "readline";
import { readConfig, writeConfig } from "../config.js";
import chalk from "chalk";

export async function setupCommand(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q: string) => new Promise<string>((res) => rl.question(q, res));

  const current = readConfig();
  const key = await question(
    chalk.cyan("Claude API key") + (current.apiKey ? " (leave blank to keep existing): " : ": ")
  );

  rl.close();

  if (key.trim()) {
    writeConfig({ ...current, apiKey: key.trim() });
    console.log(chalk.green("API key saved."));
  } else {
    console.log("No changes.");
  }
}
