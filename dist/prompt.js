export function buildSystemPrompt(game) {
    const pending = game.trophies.filter((t) => !t.done);
    const done = game.trophies.filter((t) => t.done).length;
    const trophyList = pending
        .map((t) => {
        const missable = t.missable ? " [MISSABLE]" : "";
        const dlc = t.dlc ? ` (DLC: ${t.dlc})` : "";
        return `- ${t.name}${missable}${dlc}: ${t.description}`;
    })
        .join("\n");
    const modeInstructions = game.mode === "explore"
        ? `Mode: EXPLORE (blind run)
DO NOT reveal areas, bosses, story beats, or events beyond what the player has noted.
Give minimal directional hints only. Never spoil what comes next.`
        : `Mode: PLATINUM (full spoilers allowed)
Prioritize missable trophies. Suggest the most efficient completion order.
Be direct and specific.`;
    return `You are a focused game companion for ${game.name}.
${modeInstructions}

Progress: ${done}/${game.trophies.length} trophies completed.
Pending trophies (${pending.length}):
${trophyList || "None — all done!"}

Player notes: "${game.notes || "none"}"

Rules:
- Be concise. Answer only what is asked. No filler.
- If the player tells you your answer was wrong or didn't work, acknowledge it and try a completely different approach.`;
}
