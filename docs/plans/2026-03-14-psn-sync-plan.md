# PSN Trophy Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `sync` command that pulls trophy completion status from PSNProfiles and updates the local game JSON.

**Architecture:** The skill shells out to a Node one-liner using built-in `fetch()` with `X-Requested-With: XMLHttpRequest` header (bypasses Cloudflare). Two endpoints: profile AJAX to discover the game link, trophy page to get completion status. No npm dependencies.

**Tech Stack:** Node.js built-in `fetch()`, regex HTML parsing, jq for counts.

---

### Task 1: Add `psnUsername` to config schema

**Files:**
- Modify: `skill/mimir-session.md` (Step 1 section, around line 12)
- Modify: `CLAUDE.md` (Data section, around line 62)

**Step 1: Add psnUsername to the skill's Step 1 section**

In `skill/mimir-session.md`, after reading `~/.mimir/config.json` in Step 1 (line 12), the skill already reads `activeGame`. No change needed here — `psnUsername` is only read when `sync` is invoked.

**Step 2: Document psnUsername in CLAUDE.md**

In `CLAUDE.md`, update the Data section to mention `psnUsername`:

```markdown
Active game tracked in `~/.mimir/config.json` via `activeGame` field. PSN username stored via `psnUsername` field (set on first `sync`).
```

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add psnUsername to config schema documentation"
```

---

### Task 2: Add `sync` command to the skill

**Files:**
- Modify: `skill/mimir-session.md` (Commands section, after the `refresh` command block ending at line 344)

**Step 1: Add the sync command block**

In `skill/mimir-session.md`, add the following after the `refresh` command block (after line 344, before the final `---`):

```markdown
---

**`sync`** — Sync trophy status from PSNProfiles.

1. Read `psnUsername` from `~/.mimir/config.json`. If missing, ask the user for their PSN username, save it to `config.json` using the Edit tool, then continue.

2. Discover the game's PSNProfiles trophy URL. Run this Node script via Bash:

```bash
node -e "
fetch('https://psnprofiles.com/' + process.argv[1] + '?ajax=1&completion=all&order=last-played&pf=all&page=1', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest' }
}).then(r => r.json()).then(d => {
  const re = /href=\"(\/trophies\/[^\"]+)\"/g;
  let m; const links = [];
  while ((m = re.exec(d.html)) !== null) links.push(m[1]);
  const unique = [...new Set(links)];
  console.log(JSON.stringify(unique));
}).catch(() => console.log('ERROR'))
" "USERNAME"
```

Replace `USERNAME` with the `psnUsername` value. From the returned array of trophy page paths, find the one whose slug portion matches `game.name` (case-insensitive, fuzzy). For example, for game name "Dark Souls 3", match `/trophies/4477-dark-souls-iii`. If no match found, tell the user: "Couldn't find **[game name]** on your PSN profile."

3. Fetch trophy completion data. Run this Node script via Bash:

```bash
node -e "
fetch('https://psnprofiles.com' + process.argv[1] + '?secret=show', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest' }
}).then(r => r.text()).then(html => {
  const rows = [...html.matchAll(/<tr class=\"(completed|)\">[\\s\\S]*?<a class=\"title\"[^>]*>([^<]+)<\\/a>/g)];
  const trophies = rows.map(m => ({ name: m[2], completed: m[1] === 'completed' })).filter(t => t.name.length > 1);
  console.log(JSON.stringify(trophies));
}).catch(() => console.log('ERROR'))
" "TROPHY_PATH"
```

Replace `TROPHY_PATH` with the discovered path (e.g. `/trophies/4477-dark-souls-iii/FellCallegas`).

If the output is `ERROR`, reply: "Sync failed — PSNProfiles might be down. Try again later."

4. Parse the JSON output. For each PSN trophy where `completed: true`, find the matching local trophy by fuzzy-matching `name` against `trophies[].name` in the game JSON (case-insensitive). If a match is found and the local trophy has `"done": false`, update it to `"done": true` using the Edit tool.

5. Do NOT unmark trophies — if a local trophy is `done: true` but PSN says `completed: false`, leave it alone (local overrides are trusted).

6. After all updates, use jq to count done/total trophies, then report:
   - No changes: "Synced **[game name]** — [done]/[total] trophies. Already up to date."
   - Changes found: "Synced **[game name]** — marked **Trophy1**, **Trophy2** as done. [done]/[total] now."
```

**Step 2: Commit**

```bash
git add skill/mimir-session.md
git commit -m "feat: add sync command to pull trophy status from PSNProfiles"
```

---

### Task 3: Add `sync` to CLAUDE.md command table

**Files:**
- Modify: `CLAUDE.md` (command table, around line 34-48)

**Step 1: Add sync to the command table**

Add this row to the command table in `CLAUDE.md`:

```markdown
| `sync` | Pull trophy status from PSNProfiles |
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add sync command to CLAUDE.md command table"
```

---

### Task 4: Install updated skill and test

**Step 1: Install the updated skill**

```bash
cp skill/mimir-session.md ~/.claude/skills/mimir-session/SKILL.md
```

**Step 2: Verify the sync script works standalone**

Run the trophy fetch script manually to confirm it returns valid JSON:

```bash
node -e "
fetch('https://psnprofiles.com/trophies/4477-dark-souls-iii/FellCallegas?secret=show', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest' }
}).then(r => r.text()).then(html => {
  const rows = [...html.matchAll(/<tr class=\"(completed|)\">[\\s\\S]*?<a class=\"title\"[^>]*>([^<]+)<\/a>/g)];
  const trophies = rows.map(m => ({ name: m[2], completed: m[1] === 'completed' })).filter(t => t.name.length > 1);
  console.log(JSON.stringify(trophies));
}).catch(() => console.log('ERROR'))
" 2>/dev/null
```

Expected: JSON array of 43 trophy objects with `name` and `completed` fields.

**Step 3: Verify profile discovery works**

```bash
node -e "
fetch('https://psnprofiles.com/FellCallegas?ajax=1&completion=all&order=last-played&pf=all&page=1', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest' }
}).then(r => r.json()).then(d => {
  const re = /href=\"(\/trophies\/[^\"]+)\"/g;
  let m; const links = [];
  while ((m = re.exec(d.html)) !== null) links.push(m[1]);
  const unique = [...new Set(links)];
  console.log(JSON.stringify(unique));
}).catch(() => console.log('ERROR'))
" 2>/dev/null
```

Expected: JSON array of unique trophy page paths.

**Step 4: Update design doc to reflect final approach**

Update `docs/plans/2026-03-14-psn-sync-design.md` to note that we use built-in Node `fetch()` with XHR header instead of the `psnprofile` npm package.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-14-psn-sync-design.md
git commit -m "docs: update sync design to reflect fetch-based approach"
```
