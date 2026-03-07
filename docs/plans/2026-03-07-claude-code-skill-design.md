# Design: mimir as a Claude Code Skill

**Date:** 2026-03-07
**Status:** Approved

## Overview

Replace the standalone mimir CLI with a Claude Code skill (`/session`) that runs entirely inside the Claude Code environment — no separate API key needed, no terminal commands, just natural conversation.

## Architecture

A single skill file at `~/.claude/skills/session.md`. When invoked via `/session`:

1. Claude reads `~/.mimir/config.json` for the last active game
2. If `activeGame` exists: asks "Resuming [Game] — continue?" with option to switch
3. If no active game: lists saved games from `~/.mimir/games/` or starts fresh
4. Loads trophy list, progress, mode, and notes as working context
5. Switches into game companion mode for the rest of the session

No background process, no API key, no separate binary. Uses Claude's built-in Read/Write/Edit tools for all state management.

## In-Session Interaction

Natural conversation for questions. Specific phrases trigger state updates:

| Phrase | Action |
|--------|--------|
| `done [trophy]` | Mark trophy done in JSON (fuzzy match) |
| `undone [trophy]` | Unmark trophy |
| `note [text]` | Update notes field in JSON |
| `mode explore` / `mode platinum` | Switch game mode |
| `plan` | Generate optimal completion order from remaining trophies |
| `list` | Show pending trophies from loaded state |
| `switch [game]` | Load a different saved game |

## Data Changes

Game JSON schema: drop `history` field (Claude Code session window is the history now).

```json
{
  "name": "Elden Ring",
  "mode": "explore",
  "notes": "Just beat Margit",
  "trophies": [{ "id": "...", "name": "...", "description": "...", "dlc": null, "missable": false, "done": false }]
}
```

`~/.mimir/config.json`: drop `apiKey`, keep `activeGame`.

```json
{
  "activeGame": "elden-ring"
}
```

## File Changes

- **Delete:** entire `src/` directory (CLI replaced by skill)
- **Delete:** `package.json`, `tsconfig.json`, `node_modules/` (no longer a Node project)
- **Create:** `~/.claude/skills/session.md` (the skill)
- **Keep:** `~/.mimir/games/*.json` data files (compatible after dropping `history` field)

## Skill File Contents

The skill encodes:
- Resume/switch flow logic
- Companion mode instructions (explore vs platinum rules)
- System prompt equivalent from `src/prompt.ts`
- State update instructions (how to edit JSON for done/note/mode commands)
- Trophy generation logic (ask Claude to generate list for new games)
