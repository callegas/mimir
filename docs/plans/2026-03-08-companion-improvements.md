# Companion Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Evolve the mimir skill from a command executor into a genuine game companion — accurate, context-aware, and proactive.

**Architecture:** All changes are in `skill/session.md` — a single markdown file of natural language instructions for Claude. No code, no tests in the traditional sense. Each task modifies the skill's behavior rules and is verified by running `/session` in a real or simulated session. After each task, copy the updated skill to `~/.claude/skills/session/SKILL.md` and test in a fresh session.

**Tech Stack:** Claude Code skill (markdown), JSON game state at `~/.mimir/`, WebFetch for wiki verification.

---

### Task 1: Schema extension — add `setup` and `area` fields

**Files:**
- Modify: `skill/session.md` (Generate Trophy List section, lines 54–62)

**Step 1: Update the game file schema in the skill**

Replace the JSON template in the Generate Trophy List section:

Old:
```json
{
  "name": "Game Name",
  "mode": "explore",
  "notes": "",
  "trophies": [ ...array of trophy objects... ]
}
```

New:
```json
{
  "name": "Game Name",
  "mode": "explore",
  "notes": "",
  "setup": "",
  "area": "",
  "trophies": [ ...array of trophy objects... ]
}
```

**Step 2: Deploy and verify**

```bash
cp skill/session.md ~/.claude/skills/session/SKILL.md
```

Start a new session, type a new game name, let it generate. Confirm the written JSON file contains `setup` and `area` fields.

**Step 3: Commit**

```bash
git add skill/session.md
git commit -m "feat: add setup and area fields to game schema"
```

---

### Task 2: Trophy verification via fextralife

**Files:**
- Modify: `skill/session.md` (Generate Trophy List section, after generation step)

**Step 1: Add verification step after trophy generation**

After the line `You already know PS4/PS5 trophy lists for most games. Generate the full list now.`, add:

```markdown
After generating the list, attempt to verify it:

1. Fetch `https://<game-slug>.wiki.fextralife.com/Trophy+&+Achievement+Guide`
   - `<game-slug>` is the same slug used for the game file (e.g. `darksouls3`, `eldenring`)
   - If the page loads: silently compare trophy names and count against your generated list. Correct any discrepancies (wrong names, missing trophies, wrong DLC flags) before writing the JSON.
   - If the page returns an error or doesn't exist: proceed with your generated list and add to the report: "⚠️ Could not verify trophy list against wiki — names may need manual correction."

Note: base game trophies and DLC trophies are separate PSN trophy lists. Do not mix them in the same file. When in doubt, ask the user.
```

**Step 2: Deploy and verify**

```bash
cp skill/session.md ~/.claude/skills/session/SKILL.md
```

Start a new session, initialize a new game (e.g. "Elden Ring"). Check:
- Did it attempt to fetch fextralife?
- Did the trophy count and names look accurate?
- If you block the fetch manually, does it warn?

**Step 3: Commit**

```bash
git add skill/session.md
git commit -m "feat: verify trophy list against fextralife after generation"
```

---

### Task 3: Setup tracking in companion mode

**Files:**
- Modify: `skill/session.md` (Companion Mode — Answering questions section)

**Step 1: Add setup detection and persistence rule**

After the "Answering questions" section header, add:

```markdown
**Setup tracking:**
When the user describes their build, loadout, character class, car setup, or any equipment configuration, extract the key details as a short freeform string and update the `setup` field in the game JSON using the Edit tool. Do this silently — no confirmation needed unless the user explicitly used a command.

When answering strategy, optimization, or gear questions, read `game.setup` first and tailor your answer to it. For example: if `setup` says "Sharp Sellsword Twinblades +10, Dex 52", recommend infusions and upgrade paths that suit that weapon, not generic advice.
```

**Step 2: Add `setup` command**

In the Commands section, add:

```markdown
**`setup`** — Show current setup.

Read the `setup` field from the game JSON and display it. If empty, reply: "No setup recorded yet — tell me your build or loadout and I'll save it."
```

**Step 3: Deploy and verify**

```bash
cp skill/session.md ~/.claude/skills/session/SKILL.md
```

In a session, say "I'm using a Sharp Sellsword Twinblades +10, Dex 52." Check:
- Did it update `setup` in the JSON silently?
- When you then ask "what rings should I use?", does it reference the build?
- Does `setup` command display it?

**Step 4: Commit**

```bash
git add skill/session.md
git commit -m "feat: track player setup and reference it in answers"
```

---

### Task 4: Area tracking in companion mode

**Files:**
- Modify: `skill/session.md` (Companion Mode — Answering questions section)

**Step 1: Add area detection and persistence rule**

After the setup tracking rule, add:

```markdown
**Area tracking:**
When the user mentions where they are (area name, boss fog, bonfire, DLC name), update the `area` field in the game JSON using the Edit tool. Do this silently.

When answering location or navigation questions, read `game.area` first and use it as context for your answer. Never ask the user where they are if `area` is already set and hasn't changed.
```

**Step 2: Deploy and verify**

```bash
cp skill/session.md ~/.claude/skills/session/SKILL.md
```

In a session, say "I'm in Irithyll of the Boreal Valley." Check:
- Did `area` update in the JSON?
- Ask "where's the next bonfire?" — does it answer relative to Irithyll?

**Step 3: Commit**

```bash
git add skill/session.md
git commit -m "feat: track current area and use it to contextualize answers"
```

---

### Task 5: Proactive prompts on transitions

**Files:**
- Modify: `skill/session.md` (Companion Mode — Answering questions section)

**Step 1: Add transition detection rule**

After the area tracking rule, add:

```markdown
**Proactive prompts:**
When the user announces a major transition — starting a DLC, entering a new area for the first time, defeating a significant boss, or stating a new goal — respond with a short checkpoint prompt (1–3 sentences):

- What's worth watching for ahead (without spoilers in explore mode; with relevant missables in platinum mode)
- What to report back so you can help better (e.g. "let me know when you reach the boss fog" or "tell me if you find a new NPC")

Keep it lightweight. Never more than 3 sentences. Don't repeat it unless the user enters another new transition.

Examples:
- User: "I'm starting the DLC" → "Ashes of Ariandel has two bosses and a handful of missable weapons. Let me know when you reach the Rope Bridge Cave bonfire and I'll give you a heads up on what's nearby."
- User: "Just beat Pontiff Sulyvahn" → "Nice — Anor Londo is next. In platinum mode, watch for Aldrich Faithful covenant and Gwyndolin's area. Let me know when you're in."
```

**Step 2: Deploy and verify**

```bash
cp skill/session.md ~/.claude/skills/session/SKILL.md
```

In a session, say "I'm about to start the Ringed City DLC." Check:
- Did the companion offer a relevant, concise checkpoint prompt?
- Was it spoiler-appropriate for the current mode?

**Step 3: Commit**

```bash
git add skill/session.md
git commit -m "feat: add proactive checkpoint prompts on major transitions"
```

---

### Task 6: Platinum content surfacing

**Files:**
- Modify: `skill/session.md` (Companion Mode — Mode rules section, platinum mode)

**Step 1: Expand the platinum mode rules**

Replace:
```markdown
**platinum mode** (full spoilers):
- Prioritize missable trophies. Suggest the most efficient completion order.
- Be direct and specific.
```

With:
```markdown
**platinum mode** (full spoilers):
- Prioritize missable trophies. Suggest the most efficient completion order.
- Be direct and specific.
- When `game.area` is updated, proactively mention relevant NPCs, key items, weapons, and unlockables for that area in 2–4 bullet points. Draw from your knowledge; if the area is a DLC, fetch `https://<game-slug>.wiki.fextralife.com/<DLC+Name>` for the content index if you're uncertain.
- Focus on things the player might otherwise miss — not a full walkthrough, just a scout report.
```

**Step 2: Deploy and verify**

```bash
cp skill/session.md ~/.claude/skills/session/SKILL.md
```

In a platinum mode session, say "I just arrived at the Painted World of Ariandel." Check:
- Did the companion surface 2–4 relevant items/NPCs for that area?
- Were they useful and not overwhelming?

**Step 3: Commit**

```bash
git add skill/session.md
git commit -m "feat: surface relevant area content proactively in platinum mode"
```

---

### Task 7: Lore recaps

**Files:**
- Modify: `skill/session.md` (Companion Mode — Answering questions section)

**Step 1: Add lore recap opt-in on game start**

In the "Load active game" section, after the resume prompt, add:

```markdown
If this is the first session for a newly initialized game (i.e. `notes` is empty and `done` count is 0), ask once:

> "Want lore recaps after boss fights and major story moments? I'll keep them short."

Store the answer by appending `lore_recaps:on` or `lore_recaps:off` to the `notes` field.
```

**Step 2: Add lore recap trigger in companion mode**

After the proactive prompts rule, add:

```markdown
**Lore recaps:**
If `game.notes` contains `lore_recaps:on`: after the user reports defeating a boss or witnessing a major story event, offer a short lore TL;DR (3–5 sentences max). Cover: who the character was, what just happened narratively, why it matters in the broader story. Style: atmospheric and brief — match the tone of the game, don't over-explain.

If `game.notes` contains `lore_recaps:off` or the field is absent: never offer unsolicited lore. Only explain lore if directly asked.
```

**Step 3: Deploy and verify**

```bash
cp skill/session.md ~/.claude/skills/session/SKILL.md
```

Start a new game session. Check:
- Is the lore recap opt-in question asked once?
- If yes: beat a boss, confirm a short lore recap is offered.
- If no: confirm no recap is offered unless asked.

**Step 4: Commit**

```bash
git add skill/session.md
git commit -m "feat: add opt-in lore recaps after boss fights and story moments"
```

---

### Task 8: Install and final verification

**Step 1: Ensure skill is installed from repo**

```bash
cp skill/session.md ~/.claude/skills/session/SKILL.md
```

**Step 2: Full session smoke test**

Start a fresh Claude Code session and run `/session`. Verify:
- [ ] New game generates correct trophy list (fextralife verified)
- [ ] `setup` and `area` fields present in the JSON
- [ ] Mentioning a build updates `setup` silently
- [ ] Mentioning a location updates `area` silently
- [ ] Announcing "starting the DLC" triggers a checkpoint prompt
- [ ] In platinum mode, arriving in a new area surfaces 2–4 relevant items
- [ ] Lore recap opt-in asked on first session of a new game

**Step 3: Update CLAUDE.md install instructions if needed**

Check `CLAUDE.md` — if the install command or data schema docs need updating, edit them now.

**Step 4: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: update install instructions and schema docs post-improvements"
```
