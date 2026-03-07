// tests/prompt.test.ts
import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "../src/prompt.js";
import type { Game } from "../src/types.js";

const game: Game = {
  name: "Dark Souls 3",
  mode: "platinum",
  notes: "Just beat Pontiff",
  history: [],
  trophies: [
    { id: "a", name: "Enkindle", description: "Obtain all endings", dlc: null, missable: true, done: false },
    { id: "b", name: "Lords of Cinder", description: "Defeat all lords", dlc: null, missable: false, done: true },
  ],
};

describe("buildSystemPrompt", () => {
  it("includes game name", () => {
    expect(buildSystemPrompt(game)).toContain("Dark Souls 3");
  });

  it("lists pending trophies", () => {
    expect(buildSystemPrompt(game)).toContain("Enkindle");
  });

  it("does not list completed trophies", () => {
    expect(buildSystemPrompt(game)).not.toContain("Lords of Cinder");
  });

  it("includes missable flag for missable trophies", () => {
    expect(buildSystemPrompt(game)).toContain("[MISSABLE]");
  });

  it("includes player notes", () => {
    expect(buildSystemPrompt(game)).toContain("Just beat Pontiff");
  });

  it("includes explore mode instructions when mode is explore", () => {
    const exploreGame = { ...game, mode: "explore" as const };
    expect(buildSystemPrompt(exploreGame)).toContain("DO NOT reveal");
  });
});
