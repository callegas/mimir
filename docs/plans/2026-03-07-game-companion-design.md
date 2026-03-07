# Game Companion CLI — Design Doc

**Date:** 2026-03-07
**Project:** `mimir` — personal AI-powered game companion CLI

## Problem

Using ChatGPT as a gaming assistant works well conversationally but has key friction points:
- Context bleeds between games (DS3 info showing up in a DS1 session)
- No persistent memory of trophy progress across sessions
- Over-explains; not easily corrected when wrong

## Solution

A TypeScript/Node CLI called `mimir` backed by the Anthropic Claude API. Each game has an isolated profile with its trophy list, progress, notes, and short conversation history. The system prompt is built dynamically from the active game file, keeping each session fully scoped.

## Architecture

**Stack:** TypeScript · Node.js · Anthropic SDK · local JSON files (no DB, no server)

**State location:** `~/.mimir/`
```
~/.mimir/
  config.json          # Claude API key, active game slug
  games/
    dark-souls-3.json
    nioh-2.json
    ...
```

**Game file schema:**
```json
{
  "name": "Dark Souls 3",
  "mode": "platinum",
  "trophies": [
    {
      "id": "enkindle",
      "name": "Enkindle",
      "description": "Obtain all endings",
      "dlc": null,
      "missable": true,
      "done": false
    }
  ],
  "notes": "Finished blind playthrough. NG+1 in progress.",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

History is capped at the last 10 exchanges per game. Switching games loads a different history — zero context bleeding.

## Commands

```bash
# Setup
mimir setup                              # prompt for Claude API key, save to config

# Game management
mimir use "dark souls 3"                 # switch active game (fuzzy name match)
mimir status                             # active game + trophy progress summary
mimir note "NG+1, just beat Pontiff"     # update free-text context for Claude
mimir mode explore                       # switch to explore (blind run) mode
mimir mode platinum                      # switch to platinum (full spoilers) mode

# Trophy tracking
mimir list                               # all trophies, pending/done, missables flagged
mimir list --dlc "ringed-city"           # filter by DLC
mimir done "enkindle"                    # mark trophy done (fuzzy name match)
mimir undone "enkindle"                  # unmark

# AI assistant
mimir ask "what should I focus on next?" # chat with Claude in context
mimir plan                               # Claude generates optimal trophy order
mimir wrong                              # last answer was wrong — Claude retries differently
mimir clear                              # reset conversation history for current game
```

## Modes

**`explore`** — first playthrough, no spoilers. Claude gives minimal directional hints only. Respects the checkpoint in `notes` (e.g., "just beat Vordt") and does not mention anything beyond it: future areas, bosses, story beats.

**`platinum`** — efficient routing. Full spoilers. Claude prioritizes missables urgently, suggests optimal order, and gives direct answers.

Mode is stored per game. A new game defaults to `explore`.

## Claude Prompt Strategy

Every AI call builds the system prompt dynamically:

```
You are a focused game companion for {game.name}.
Mode: {mode}

Progress: {done}/{total} trophies completed.
Pending trophies:
{list of pending trophies, missables flagged}

Player notes: "{notes}"

Rules:
- Be concise. Answer only what is asked.
- [explore] Do NOT reveal areas, bosses, or story beyond the player's noted checkpoint.
- [platinum] Prioritize missables. Suggest the most efficient order.
- If the player tells you your answer was wrong or didn't work, acknowledge it and approach the question differently.
```

The game's `history` (last 10 exchanges) is appended after the system prompt as the conversation messages array. The `wrong` command appends a correction note before re-sending the last user message.

## Bundled Trophy Data

Pre-bundled JSON trophy lists for the initial supported games:
- Dark Souls 3 (+ DLC: Ashes of Ariandel, The Ringed City)
- Dark Souls 1 Remastered
- Demon's Souls Remake
- Nioh 2
- Cyberpunk 2077

For any other game: `mimir import <trophies.json>` accepts a custom list in the same schema.

## Out of Scope (v1)

- PSN API integration (auto-sync trophy status from PlayStation Network)
- Multiplayer / sharing progress
- GUI / TUI
- Web app
