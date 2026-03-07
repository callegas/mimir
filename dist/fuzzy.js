import Fuse from "fuse.js";
export function fuzzyFindTrophy(query, trophies) {
    const fuse = new Fuse(trophies, { keys: ["name"], threshold: 0.4 });
    const results = fuse.search(query);
    return results[0]?.item ?? null;
}
