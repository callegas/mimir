import { describe, it, expect } from "vitest";
import { parseTrophyList } from "../src/commands/use.js";

const validJson = JSON.stringify([
  { id: "enkindle", name: "Enkindle", description: "Obtain all endings", dlc: null, missable: true, done: false },
  { id: "lords", name: "Lords of Cinder", description: "Defeat all lords", dlc: null, missable: false, done: false },
]);

describe("parseTrophyList", () => {
  it("parses a valid JSON trophy array", () => {
    const trophies = parseTrophyList(validJson);
    expect(trophies).toHaveLength(2);
    expect(trophies[0].id).toBe("enkindle");
  });

  it("extracts JSON from markdown code block if present", () => {
    const wrapped = "```json\n" + validJson + "\n```";
    const trophies = parseTrophyList(wrapped);
    expect(trophies).toHaveLength(2);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseTrophyList("not json")).toThrow();
  });
});
