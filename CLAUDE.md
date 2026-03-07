# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Run CLI without building (tsx)
npm run build        # Compile TypeScript to dist/
npm test             # Run Vitest tests
npm run test:watch   # Watch mode
npm link             # Install mimir globally from local build
```

## Architecture

TypeScript CLI (`mimir`) — personal AI game companion. State stored as JSON files in `~/.mimir/`:
- `config.json` — API key + active game slug
- `games/<slug>.json` — trophy list, progress, notes, conversation history (Game type)

Every AI call builds a system prompt from the active game file via `src/prompt.ts`, then sends the last 20 messages (10 exchanges) as conversation history. No context bleeds between games.

Two modes per game: `explore` (no spoilers, blind run) and `platinum` (full spoilers, efficient routing).

Trophy lists are generated on demand by Claude when `mimir use "<game>"` is run for the first time — no bundled data files. For obscure games, `mimir import <file.json>` accepts a manual trophy list.

**Key files:**
- `src/cli.ts` — entry point, all command registration
- `src/active.ts` — `requireActiveGame()` helper used by all commands
- `src/ai.ts` — Claude API calls, history management
- `src/prompt.ts` — system prompt builder
- `src/fuzzy.ts` — fuzzy trophy/game name matching (Fuse.js)
- `src/commands/use.ts` — `parseTrophyList()` + Claude-based trophy generation
