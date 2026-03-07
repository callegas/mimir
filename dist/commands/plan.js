import { requireActiveGame } from "../active.js";
import { chat } from "../ai.js";
export async function planCommand() {
    const { slug } = requireActiveGame();
    await chat("Based on my current trophy progress and notes, give me the most efficient order to complete the remaining trophies. Group by area or quest where possible. Flag missables first.", slug);
}
