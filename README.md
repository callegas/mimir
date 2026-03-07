# mimir

> Your AI gaming companion — like having a friend who's beaten every game.

Back in the 90s, gaming magazines were the perfect companion. You'd play blind, get stuck, and only then flip to the walkthrough — just enough to get unstuck, never enough to ruin the journey. Mimir is that friend. It knows everything, but only tells you what you need.

## What it does

- **Explore mode** — playing blind? Mimir gives directional hints only, respects your checkpoint, never spoils what's ahead
- **Platinum mode** — ready to 100%? Mimir plans the most efficient trophy route, flags missables, and keeps you on track
- **Game-isolated context** — no cross-game confusion. Your DS3 session knows nothing about your Elden Ring session
- **Correction loop** — if an answer was wrong, `mimir wrong` tells it to try a different approach
- **Persistent memory** — your progress, notes, and conversation history survive between sessions

## Install

```bash
git clone https://github.com/felipecallegas/mimir
cd mimir
npm install
npm run build
npm link
```

Then add your Claude API key (get one at console.anthropic.com):

```bash
mimir setup
```

## Usage

```bash
# Start a new game (trophy list generated automatically)
mimir use "Dark Souls 3"
mimir use "Elden Ring"
mimir use "Hollow Knight"   # works for any game

# Set your mode
mimir mode explore           # blind run — minimal hints, no spoilers
mimir mode platinum          # cleanup — full spoilers, efficient routing

# Tell mimir where you are
mimir note "Just beat Margit, heading to Stormveil"

# Ask anything
mimir ask "I keep dying here, any tips?"
mimir ask "what build synergizes best with my remaining trophies?"

# Plan your platinum
mimir plan

# Track progress
mimir list                   # all trophies, missables highlighted
mimir list --dlc "Shadow of the Erdtree"
mimir done "Elden Lord"
mimir status

# Correct a bad answer
mimir wrong

# Switch games (no context bleeds between them)
mimir use "Cyberpunk 2077"
```

## Philosophy

Mimir doesn't play the game for you. It's the friend on the couch who's beaten it twice — they'll tell you there's something important in that room, but they won't tell you what it is until you ask. The experience is yours. Mimir just makes sure you don't miss anything.

## Requirements

- Node.js 18+
- A Claude API key (Anthropic)

## Data

All your data lives locally in `~/.mimir/` — one JSON file per game. Nothing is sent anywhere except your questions to the Claude API.
