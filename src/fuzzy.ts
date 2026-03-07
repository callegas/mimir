import Fuse from "fuse.js";
import type { Trophy } from "./types.js";

export function fuzzyFindTrophy(query: string, trophies: Trophy[]): Trophy | null {
  const fuse = new Fuse(trophies, { keys: ["name"], threshold: 0.4 });
  const results = fuse.search(query);
  return results[0]?.item ?? null;
}
