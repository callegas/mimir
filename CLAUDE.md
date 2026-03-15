# CLAUDE.md

This repo contains the mimir game companion skill for Claude Code.

## Usage

Install the skill:
```bash
mkdir -p ~/.claude/skills/mimir-session && cp skill/mimir-session.md ~/.claude/skills/mimir-session/SKILL.md
```

Then in any Claude Code session:
```
/mimir-session
```

Start a new session after installing — skill discovery runs at session start.

## How it works

`/mimir-session` loads your active game and switches Claude into companion mode for the rest of the conversation. No API key needed — it runs entirely inside Claude Code using its built-in file tools.

When you start a new game, Claude generates the full trophy list automatically from its knowledge. You just type the game name.

### Modes

- **explore** — blind run, no spoilers. Claude gives minimal hints only, staying behind your noted checkpoint.
- **platinum** — full spoilers. Claude prioritizes missables and suggests the most efficient completion order.

New games default to `explore`. Switch anytime with `mode platinum`.

### In-session commands

| Command | Action |
|---|---|
| `done <name>` | Mark a trophy as done (fuzzy match) |
| `undone <name>` | Unmark a trophy |
| `note <text>` | Update your notes for the current game |
| `setup` | Show your recorded build or loadout |
| `mode explore` / `mode platinum` | Switch mode |
| `list` | Show pending trophies |
| `list all` | Show all trophies including completed |
| `plan` | Generate optimal completion order |
| `switch <game>` | Switch to a different saved game |
| `checklist` | Show full checklist for current area |
| `check <text>` | Mark a checklist item as done (fuzzy match) |
| `uncheck <text>` | Unmark a checklist item |
| `refresh` | Re-fetch cheat sheet data for current area |
| `sync` | Pull trophy status from PSNProfiles |

For anything else, just ask — Claude answers based on the current mode rules.

## Data

Game state is stored as JSON in `~/.mimir/games/<slug>.json`:
- `name` — game name
- `mode` — `"explore"` or `"platinum"`
- `notes` — freeform player notes (also stores `lore_recaps:on/off`)
- `setup` — current build or loadout (auto-updated from conversation)
- `area` — current in-game location (auto-updated from conversation)
- `trophies` — array of trophy objects

Active game tracked in `~/.mimir/config.json` via `activeGame` field. PSN username stored via `psnUsername` field (set on first `sync`).

### Cheat Sheet Integration

Cheat sheet registry in `~/.mimir/cheatsheets.json`:
- Maps game slugs to external cheat sheet URLs
- `provider` field determines HTML parsing strategy

Area checklists cached in `~/.mimir/games/<slug>/areas/<area-slug>.json`:
- Fetched on demand from cheat sheet when entering a new area
- Items are trackable with `check`/`uncheck` commands
- Separate from trophy tracking (`done`/`undone`)
