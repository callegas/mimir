import fs from "fs";
import os from "os";
import path from "path";
const DEFAULT_DIR = path.join(os.homedir(), ".mimir");
const CONFIG_FILE = "config.json";
export function readConfig(dir = DEFAULT_DIR) {
    const file = path.join(dir, CONFIG_FILE);
    if (!fs.existsSync(file))
        return {};
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}
export function writeConfig(config, dir = DEFAULT_DIR) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, CONFIG_FILE), JSON.stringify(config, null, 2));
}
