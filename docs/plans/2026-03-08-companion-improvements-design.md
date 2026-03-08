# Mimir Companion Improvements — Design

**Date:** 2026-03-08
**Status:** Approved

## Context

Mimir is a PS4/PS5 trophy hunting companion running entirely inside Claude Code as a skill (`/session`). After a real play session with Dark Souls 3, several gaps were identified between the current skill behavior and what a genuine companion should do.

## Problems

1. **Trophy accuracy** — LLM-generated trophy lists can have wrong names, missing entries, or incorrect DLC categorization.
2. **Location assistance** — Directions were incomplete; the companion didn't always know enough about the player's current context.
3. **No setup/context tracking** — Build, loadout, or equipment info had to be repeated by the user across questions.
4. **No proactive prompts** — When the user announced major transitions (starting a DLC, reaching a new area), the companion didn't offer relevant guidance or ask for useful checkpoints.
5. **Platinum mode too narrow** — Platinum mode focused only on trophies, but the user's goal is to experience everything the game has to offer, not just tick boxes.
6. **No lore context** — Souls-like storytelling is cryptic; users often don't know what just happened after a boss fight or cutscene.

## Design

### 1. Trophy Accuracy via Wiki Verification

After generating a trophy list from LLM knowledge, fetch:
```
https://<game-slug>.wiki.fextralife.com/Trophy+&+Achievement+Guide
```
Silently compare and correct names, count, and missable flags before writing the JSON.
If the page is unavailable (403, timeout), proceed with LLM knowledge and warn the user to verify the list manually.

### 2. Schema Changes

Two new fields added to the game JSON:

```json
{
  "name": "Game Name",
  "mode": "explore",
  "notes": "",
  "setup": "",
  "area": "",
  "trophies": []
}
```

- **`setup`** — Freeform string. Populated whenever the user describes their build, car, loadout, character class, etc. Referenced automatically when answering strategy or optimization questions. Generic enough to work across game types (RPGs, racing, sports).
- **`area`** — Current area or checkpoint as described by the user. Updated when the user mentions where they are. Used by the companion to surface relevant content for that location.

### 3. Proactive Prompts

When the user announces a transition — starting a DLC, entering a new area, defeating a boss, switching mode — the companion responds with a short checkpoint prompt:

- What's worth watching for ahead
- What to report back so the companion can help better
- For platinum-bound players: relevant missables and content without full spoilers

Applies in both `explore` and `platinum` modes, adjusted by context and the user's stated goals. Tone is lightweight — a sentence or two, not a wall of instructions.

### 4. Platinum Content Surfacing

In `platinum` mode, when `area` is set or updated, the companion proactively mentions relevant NPCs, key items, weapons, and unlockables for that area. Drawn from LLM knowledge; wiki fetched if uncertain or when entering a DLC (using the DLC index page, e.g. `/<DLC+Name>`).

No checklist for the user to manage. The companion surfaces the right context at the right moment, conversationally.

### 5. Lore Recaps

After boss defeats or major area transitions, the companion offers a short TL;DR:
- Who the NPC or boss was
- What just happened story-wise
- Why the location or event matters in the broader narrative

**Opt-in:** On first session with a new game, the companion asks once whether the user wants lore recaps. Stored implicitly in the mode/notes. Style: brief, atmospheric, no hand-holding — matches the tone of Souls-style storytelling.

## Out of Scope (Future)

- **PSN API integration** — Auto-sync earned trophies via OAuth. Noted for later; not trivial in a Claude Code skill context.
- **Per-area content checklists** — May revisit if proactive surfacing proves insufficient.

## Principles

- Improve incrementally — ship, play, observe, refine.
- Generic over game-specific — every design decision should work for any game, not just DS3.
- Companion-first — the skill should behave like someone paying attention, not a command executor.
