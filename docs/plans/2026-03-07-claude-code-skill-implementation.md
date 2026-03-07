# mimir Claude Code Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the mimir Node.js CLI with a single Claude Code skill (`/session`) that runs entirely inside Claude Code using the existing session — no API key required.

**Architecture:** A markdown skill file at `~/.claude/skills/session.md` encodes all game companion logic. Claude reads/writes game state directly via its built-in file tools. Trophy generation for new games uses Claude's own knowledge (no external API call needed). Game data stays in `~/.mimir/games/*.json`.

**Tech Stack:** Claude Code skill system (markdown), JSON file storage in `~/.mimir/`

---

### Task 1: Write the skill file

**Files:**
- Create: `skill/session.md` (in repo, for version control)
- Install: `~/.claude/skills/session.md` (where Claude Code loads it from)

**Step 1: Create the skill directory in the repo**

```bash
mkdir -p /Users/fellipe.callegas/Repositories/Personal/mimir/skill
```

**Step 2: Write `skill/session.md`**

```markdown
---
name: session
description: Load your mimir game companion session. Resumes last active game or lets you pick/start one. Use this to track trophy progress and get game hints.
---

# mimir Game Companion

You are a focused PS4/PS5 trophy hunting companion. When this skill is invoked, follow this exact flow:

## Step 1: Load active game

Read the file `~/.mimir/config.json`.

- If the file doesn't exist or has no `activeGame`: go to **New Session** below.
- If `activeGame` exists (e.g. `"elden-ring"`): read `~/.mimir/games/<activeGame>.json`, then ask the user:

> "Resuming **[game.name]** ([mode] mode) — [done]/[total] trophies. Continue, or switch to a different game?"

If they say continue (or just respond naturally), go to **Companion Mode**.
If they want to switch, go to **Switch Game**.

## New Session

List all files in `~/.mimir/games/` (if directory exists). Present saved games as a numbered list and ask:

> "Which game? Pick a number or type a new game name."

- If they pick a saved game: load it, update `activeGame` in config, go to **Companion Mode**.
- If they type a new game name: go to **Generate Trophy List**.

## Switch Game

Same as New Session but only shown when user wants to switch from an active game.

## Generate Trophy List

You already know PS4/PS5 trophy lists for most games. Generate the full list now.

For each trophy, create a JSON object:
```json
{
  "id": "kebab-case-id",
  "name": "Trophy Name",
  "description": "One sentence: how to unlock it.",
  "dlc": null,
  "missable": false,
  "done": false
}
```

- `dlc`: `null` for base game trophies, or the exact DLC name string
- `missable`: `true` only if the trophy can be permanently locked out in a single playthrough

Write the game file to `~/.mimir/games/<slug>.json`:
```json
{
  "name": "Game Name",
  "mode": "explore",
  "notes": "",
  "trophies": [ ...array of trophy objects... ]
}
```

Where `<slug>` is the game name lowercased, spaces replaced with `-`, special chars removed.

Update `~/.mimir/config.json` with `{ "activeGame": "<slug>" }` (preserve any other fields).

Report: "Initialized **[Game]** with [N] trophies. [M] are missable — review with `list`."

Then go to **Companion Mode**.

## Companion Mode

You are now the game companion for `game.name`. Stay in this mode for the rest of the conversation.

### Mode rules

**explore mode** (blind run — default for new games):
- Never reveal areas, bosses, story beats, or events beyond what the player has noted.
- Give minimal directional hints only. No spoilers.

**platinum mode** (full spoilers):
- Prioritize missable trophies. Suggest the most efficient completion order.
- Be direct and specific.

### Answering questions

For any game question, answer based on the current mode rules. Be concise. No filler.

Show progress context when relevant: "X/Y trophies done."

If the player says your answer was wrong or didn't work, acknowledge it and try a completely different approach.

### Commands

When the user says any of these, take the described action **and confirm**:

---

**`done <name>`** — Mark a trophy as done.

Fuzzy-match `<name>` against pending trophies in the loaded game. Find the closest match.
In the game JSON, set `"done": true` on that trophy using the Edit tool.
Reply: "Marked **[Trophy Name]** as done. [remaining]/[total] remaining."

---

**`undone <name>`** — Unmark a trophy.

Same fuzzy match, set `"done": false`.
Reply: "Unmarked **[Trophy Name]**."

---

**`note <text>`** — Update your notes.

Set `notes` field in the game JSON to `<text>` using the Edit tool.
Reply: "Notes updated."

---

**`mode explore`** or **`mode platinum`** — Switch mode.

Set `mode` field in game JSON using the Edit tool.
Reply: "Switched to [mode] mode."

---

**`plan`** — Generate optimal completion order.

List all pending trophies. In platinum mode, sort by: missable first, then DLC last, then logical story order. In explore mode, only show missable trophies the player should watch for without spoilers.

---

**`list`** — Show pending trophies.

Display all trophies where `done: false`. Group by DLC (base game first). Mark missables with [MISSABLE].

---

**`list all`** — Show all trophies including completed ones.

Same as list but include done trophies, marked with [DONE].

---

**`switch <game>`** — Switch to a different game.

Go to **Switch Game** flow, fuzzy-matching `<game>` against saved game slugs first.

---

For anything else, answer as the game companion per mode rules.
```

**Step 3: Install the skill**

```bash
mkdir -p ~/.claude/skills
cp /Users/fellipe.callegas/Repositories/Personal/mimir/skill/session.md ~/.claude/skills/session.md
```

**Step 4: Verify skill is visible to Claude Code**

Open a new Claude Code session and type `/session` — it should invoke the skill. Verify it reads `~/.mimir/config.json` correctly.

**Step 5: Commit**

```bash
cd /Users/fellipe.callegas/Repositories/Personal/mimir
git add skill/session.md
git commit -m "feat: add /session Claude Code skill"
```

---

### Task 2: Migrate existing game data

**Files:**
- Modify: `~/.mimir/games/*.json` (strip `history` field)
- Modify: `~/.mimir/config.json` (strip `apiKey` field)

**Step 1: Check what exists**

```bash
ls ~/.mimir/games/ 2>/dev/null && cat ~/.mimir/config.json 2>/dev/null
```

**Step 2: Strip `history` from each game JSON**

For each game file in `~/.mimir/games/`, remove the `history` array field. Use the Edit tool or run:

```bash
for f in ~/.mimir/games/*.json; do
  node -e "
    const fs = require('fs');
    const g = JSON.parse(fs.readFileSync('$f', 'utf-8'));
    delete g.history;
    fs.writeFileSync('$f', JSON.stringify(g, null, 2));
  "
done
```

(Skip this step if no game files exist yet.)

**Step 3: Strip `apiKey` from config**

```bash
node -e "
  const fs = require('fs');
  const p = process.env.HOME + '/.mimir/config.json';
  if (!fs.existsSync(p)) process.exit(0);
  const c = JSON.parse(fs.readFileSync(p, 'utf-8'));
  delete c.apiKey;
  fs.writeFileSync(p, JSON.stringify(c, null, 2));
"
```

**Step 4: Verify**

```bash
cat ~/.mimir/config.json
# Expected: { "activeGame": "..." } — no apiKey field
```

---

### Task 3: Delete CLI source and Node project files

**Files:**
- Delete: `src/`
- Delete: `dist/` (if exists)
- Delete: `package.json`, `package-lock.json`, `tsconfig.json`
- Delete: `node_modules/`
- Keep: `docs/`, `skill/`, `.gitignore`, `README.md`, `CLAUDE.md`

**Step 1: Remove source and build artifacts**

```bash
cd /Users/fellipe.callegas/Repositories/Personal/mimir
rm -rf src/ dist/ node_modules/
rm -f package.json package-lock.json tsconfig.json
```

**Step 2: Unlink the old global binary**

```bash
npm unlink mimir 2>/dev/null || true
which mimir && echo "WARNING: mimir still in PATH" || echo "OK: mimir removed from PATH"
```

**Step 3: Verify repo state**

```bash
ls /Users/fellipe.callegas/Repositories/Personal/mimir
# Expected: CLAUDE.md  README.md  docs/  skill/  (and .git, .gitignore)
```

**Step 4: Update `.gitignore`**

Remove Node-specific entries that no longer apply. The `.gitignore` should remain valid for a non-Node repo (can be emptied or kept minimal).

**Step 5: Commit**

```bash
cd /Users/fellipe.callegas/Repositories/Personal/mimir
git add -A
git commit -m "chore: remove CLI — replaced by Claude Code skill"
```

---

### Task 4: Update CLAUDE.md and README

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

**Step 1: Rewrite CLAUDE.md**

Replace with:

```markdown
# CLAUDE.md

This repo contains the mimir game companion skill for Claude Code.

## Usage

Install the skill:
```bash
cp skill/session.md ~/.claude/skills/session.md
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
```

**Step 2: Commit**

```bash
cd /Users/fellipe.callegas/Repositories/Personal/mimir
git add CLAUDE.md README.md
git commit -m "docs: update for Claude Code skill migration"
```
