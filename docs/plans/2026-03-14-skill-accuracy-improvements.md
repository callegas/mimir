# Skill Accuracy Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the mimir companion more honest about uncertainty, accurate on trophy counts, and smoother on session resume.

**Architecture:** Three edits to the skill markdown file, then reinstall.

**Tech Stack:** Markdown (skill file), bash (install)

---

### Task 1: Update resume flow in Step 1

**Files:**
- Modify: `skill/mimir-session.md` — "Step 1: Load active game" section

**Step 1: Edit the resume flow**

Replace the current resume prompt and continue/switch logic:

```markdown
- If `activeGame` exists (e.g. `"elden-ring"`): read `~/.mimir/games/<activeGame>.json`, then ask the user:

> "Resuming **[game.name]** ([mode] mode) — [done]/[total] trophies. Continue, or switch to a different game?"

If they say continue (or just respond naturally), go to **Companion Mode**.
If they want to switch, go to **Switch Game**.
```

With:

```markdown
- If `activeGame` exists (e.g. `"elden-ring"`): read `~/.mimir/games/<activeGame>.json`, count trophies where `done: true` vs total array length, then present:

> "Back in **[game.name]** ([mode] mode) — [done]/[total] trophies. You're at [area]. [1-sentence curiosity or fun fact about the current area, drawn from your knowledge of the game]. Say `switch` anytime to change games."

If `area` is empty, skip the curiosity and infer context from the most recently completed trophies instead.

Then go straight to **Companion Mode** — no question asked.
```

**Step 2: Commit**

```bash
git add skill/mimir-session.md
git commit -m "feat: auto-resume with area curiosity instead of continue prompt"
```

---

### Task 2: Add trophy count accuracy rule

**Files:**
- Modify: `skill/mimir-session.md` — "Companion Mode" section, after "Answering questions" heading

**Step 1: Add the rule**

Add this block after the "Area tracking" subsection and before "Proactive prompts":

```markdown
**Trophy counting:**
Always read the game JSON and count entries where `done: true` vs total entries in the `trophies` array. Never estimate or calculate from memory. Re-read the file after any `done` or `undone` command before reporting counts.
```

**Step 2: Commit**

```bash
git add skill/mimir-session.md
git commit -m "feat: enforce accurate trophy counting from JSON"
```

---

### Task 3: Add wiki-assisted location answers

**Files:**
- Modify: `skill/mimir-session.md` — "Answering questions" section, after the new "Trophy counting" block

**Step 1: Add the rule**

Add this block after "Trophy counting":

```markdown
**Location and direction questions:**
When the player asks about item locations, NPC positions, paths, hidden areas, or how to reach a specific place, fetch `https://<game-slug>.wiki.fextralife.com/<Area+Name>` for the relevant area before answering. Use the wiki content to ground your answer in verified information.

If the wiki doesn't have the specific info or the fetch fails, be honest: "I'm not confident on the exact location — worth checking a wiki or YouTube walkthrough to be safe."

Never guess at specific directions, hidden paths, or item placements. Either verify first or flag uncertainty.
```

**Step 2: Commit**

```bash
git add skill/mimir-session.md
git commit -m "feat: wiki-assisted location answers with honesty fallback"
```

---

### Task 4: Reinstall the skill

**Step 1: Copy to skills directory**

```bash
cp skill/mimir-session.md ~/.claude/skills/mimir-session/SKILL.md
```

**Step 2: Verify**

```bash
diff skill/mimir-session.md ~/.claude/skills/mimir-session/SKILL.md
```

Expected: no output (files match).
