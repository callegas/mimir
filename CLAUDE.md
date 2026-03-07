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

## Data

Game state is stored as JSON in `~/.mimir/games/<slug>.json`:
- `name` — game name
- `mode` — `"explore"` or `"platinum"`
- `notes` — freeform player notes
- `trophies` — array of trophy objects

Active game tracked in `~/.mimir/config.json` via `activeGame` field.
