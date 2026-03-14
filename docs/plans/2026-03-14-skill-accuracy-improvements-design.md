# Skill Accuracy Improvements — Design

## Problem

Three issues surfaced during gameplay sessions:

1. **Wrong location/direction info** — gave confident but incorrect directions for item locations and boss paths
2. **Trophy miscounts** — reported wrong totals instead of reading from the JSON
3. **Resume flow friction** — asks "Continue or switch?" every time instead of jumping straight in

## Changes

### 1. Resume flow (Step 1: Load active game)

Replace the "Continue or switch?" prompt. When resuming:

- Read game JSON, count done trophies from data
- Present: "Back in **[game.name]** ([mode]) — [done]/[total]. You're at [area]. [1-sentence curiosity about the area]. Say `switch` anytime to change games."
- Go straight to Companion Mode — no question asked
- If `area` is empty, skip the curiosity and infer context from most recent done trophies

### 2. Trophy count accuracy (Companion Mode)

Add rule: always read the game JSON and count `done: true` entries vs total array length. Never estimate or calculate from memory. Re-read the file after any `done` or `undone` command before reporting counts.

### 3. Wiki-assisted location answers (Answering questions)

When the player asks about item locations, NPC positions, paths, hidden areas, or how to reach a place:

- Fetch `https://<game-slug>.wiki.fextralife.com/<Area+Name>` before answering
- Use wiki content to ground the answer
- If wiki doesn't have the info or fetch fails: "I'm not confident on the exact location — worth checking a wiki or YouTube walkthrough to be safe."
- Never guess at specific directions, hidden paths, or item placements
