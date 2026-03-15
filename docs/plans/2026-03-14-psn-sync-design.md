# PSN Trophy Sync Design

## Summary

Add a `sync` command to the mimir skill that pulls trophy completion status from PSNProfiles via the `psnprofile` npm package and updates the local game JSON.

## Approach

**npx one-liner** — the skill shells out to a Node one-liner that imports `psnprofile`, fetches the user's profile and game trophies, and dumps JSON to stdout. The skill then fuzzy-matches trophy names and updates `done` status in the game file. No new files in the repo.

## Config

`~/.mimir/config.json` gets a `psnUsername` field:

```json
{ "activeGame": "dark-souls-3", "psnUsername": "FellCallegas" }
```

If missing when `sync` is called, ask the user once and save it.

## Flow

1. Read `psnUsername` from config (prompt if missing, save it)
2. Run npx one-liner:
   - `require('psnprofile')`
   - Call `profile(username)` to get all games with their PSNProfiles link
   - Fuzzy-match `game.name` against profile game titles to find the right game
   - Call `game(link + '/' + username)` to get all trophies with `completed` boolean
   - Output `JSON.stringify(data.trophies)` to stdout
3. Parse the JSON output
4. For each PSN trophy, fuzzy-match `title` against local `trophies[].name`
5. Update `done` field where PSN says `completed: true` but local says `done: false`
6. Report changes:
   - No changes: "Synced **Game Name** — X/Y trophies. Already up to date."
   - Changes found: "Synced — marked **Trophy1**, **Trophy2** as done. X/Y now."

## npx Script

```bash
npx -y psnprofile node -e "
const P = require('psnprofile');
(async () => {
  const profile = await P.default.profile('USERNAME');
  const game = profile.games.find(g => g.title.includes('GAME_TITLE'));
  const data = await P.default.game(game.link + '/USERNAME');
  console.log(JSON.stringify(data.trophies));
})()
"
```

## Edge Cases

- **Game not found in profile**: "Couldn't find **[game]** on your PSN profile."
- **PSNProfiles down/403**: "Sync failed — PSNProfiles might be down."
- **New trophies on PSN not in local file**: Flag them, don't auto-add (could be uninitialized DLC).
- **Trophy name mismatch**: Use fuzzy matching (case-insensitive, partial match). If no match found for a PSN trophy, skip it silently.
- **Trophies marked done locally but not on PSN**: Don't unmark — local state is trusted for manual overrides.

## Skill Changes

1. Add `sync` command documentation to the command table in the skill
2. Add `sync` command handler in the Commands section
3. Add `psnUsername` handling to session load (read from config, no prompt unless `sync` is used)

## CLAUDE.md Changes

Add `sync` to the command table and document `psnUsername` in the config schema.
