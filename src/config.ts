import fs from "fs";
import os from "os";
import path from "path";

export interface Config {
  apiKey?: string;
  activeGame?: string;
}

const DEFAULT_DIR = path.join(os.homedir(), ".mimir");
const CONFIG_FILE = "config.json";

export function readConfig(dir = DEFAULT_DIR): Config {
  const file = path.join(dir, CONFIG_FILE);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Config;
}

export function writeConfig(config: Config, dir = DEFAULT_DIR): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, CONFIG_FILE), JSON.stringify(config, null, 2));
}
