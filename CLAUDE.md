# CLAUDE.md

This repo contains the mimir game companion skill for Claude Code.

## Usage

Install the skill:
```bash
mkdir -p ~/.claude/skills/session && cp skill/session.md ~/.claude/skills/session/SKILL.md
```

Then in any Claude Code session:
```
/session
```

Start a new session after installing — skill discovery runs at session start.

## How it works

`/session` loads your active game and switches Claude into companion mode for the rest of the conversation. No API key needed — it runs entirely inside Claude Code using its built-in file tools.

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

For anything else, just ask — Claude answers based on the current mode rules.

## Data

Game state is stored as JSON in `~/.mimir/games/<slug>.json`:
- `name` — game name
- `mode` — `"explore"` or `"platinum"`
- `notes` — freeform player notes (also stores `lore_recaps:on/off`)
- `setup` — current build or loadout (auto-updated from conversation)
- `area` — current in-game location (auto-updated from conversation)
- `trophies` — array of trophy objects

Active game tracked in `~/.mimir/config.json` via `activeGame` field.
