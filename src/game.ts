import fs from "fs";
import os from "os";
import path from "path";
import type { Game } from "./types.js";

const DEFAULT_DIR = path.join(os.homedir(), ".mimir");

export function gameSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function gamesDir(dir = DEFAULT_DIR): string {
  return path.join(dir, "games");
}

export function readGame(slug: string, dir = DEFAULT_DIR): Game {
  const file = path.join(gamesDir(dir), `${slug}.json`);
  if (!fs.existsSync(file)) throw new Error(`Game not found: ${slug}`);
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Game;
}

export function writeGame(game: Game, dir = DEFAULT_DIR): void {
  const d = gamesDir(dir);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, `${gameSlug(game.name)}.json`), JSON.stringify(game, null, 2));
}

export function listGames(dir = DEFAULT_DIR): string[] {
  const d = gamesDir(dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
}
