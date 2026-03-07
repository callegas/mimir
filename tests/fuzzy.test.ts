import { describe, it, expect } from "vitest";
import { fuzzyFindTrophy } from "../src/fuzzy.js";
import type { Trophy } from "../src/types.js";

const trophies: Trophy[] = [
  { id: "enkindle", name: "Enkindle", description: "", dlc: null, missable: true, done: false },
  { id: "lords-of-cinder", name: "Lords of Cinder", description: "", dlc: null, missable: false, done: false },
];

describe("fuzzyFindTrophy", () => {
  it("finds exact match", () => {
    expect(fuzzyFindTrophy("Enkindle", trophies)?.id).toBe("enkindle");
  });

  it("finds partial match", () => {
    expect(fuzzyFindTrophy("lords", trophies)?.id).toBe("lords-of-cinder");
  });

  it("returns null for no match", () => {
    expect(fuzzyFindTrophy("zzz", trophies)).toBeNull();
  });
});
