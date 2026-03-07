import { requireActiveGame } from "../active.js";
import { chat } from "../ai.js";
export async function askCommand(question) {
    const { slug } = requireActiveGame();
    await chat(question, slug);
}
