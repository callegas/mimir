import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readGame, writeGame, listGames, gameSlug } from "../src/game.js";
import type { Game } from "../src/types.js";
import fs from "fs";
import os from "os";
import path from "path";

const TEST_DIR = path.join(os.tmpdir(), ".mimir-test-" + Date.now());

const mockGame: Game = {
  name: "Dark Souls 3",
  mode: "mimirinum",
  trophies: [],
  notes: "",
  history: [],
};

describe("game", () => {
  beforeEach(() => fs.mkdirSync(path.join(TEST_DIR, "games"), { recursive: true }));
  afterEach(() => fs.rmSync(TEST_DIR, { recursive: true }));

  it("generates slug from name", () => {
    expect(gameSlug("Dark Souls 3")).toBe("dark-souls-3");
  });

  it("throws when game not found", () => {
    expect(() => readGame("dark-souls-3", TEST_DIR)).toThrow("Game not found");
  });

  it("writes and reads a game", () => {
    writeGame(mockGame, TEST_DIR);
    const result = readGame("dark-souls-3", TEST_DIR);
    expect(result.name).toBe("Dark Souls 3");
  });

  it("lists saved games", () => {
    writeGame(mockGame, TEST_DIR);
    expect(listGames(TEST_DIR)).toContain("dark-souls-3");
  });
});
