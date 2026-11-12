# NEON RUSH

A self-contained, single-player arcade survival game built with HTML5 Canvas, CSS and vanilla JavaScript.

## Run locally

1. Extract `neon-rush.zip`.
2. Open `index.html` in a modern browser.
3. Click **INITIATE RUN**.

No installation, account, backend, database or API key is required.

For a local development server (optional):

```bash
cd neon-rush
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls

- **WASD / Arrow keys:** Move
- **P / Escape:** Pause
- **Touch / pointer:** Drag to steer on touchscreens

## Gameplay

- Avoid incoming asteroids.
- Collect cyan energy orbs for points.
- Collect purple shield pickups for temporary protection.
- Survive longer as the threat index increases.
- You have three hull points.
- Personal best and settings are stored in browser local storage.

## Project structure

- `index.html` — screens and interface
- `css/style.css` — visual design and responsive layout
- `js/game.js` — canvas game loop, entities, movement, collisions and scoring
- `js/audio.js` — generated sound effects using Web Audio
- `js/main.js` — screen navigation and UI wiring

## Notes

The game is designed to run offline after its first load. The optional Google Fonts import is a progressive enhancement; system fallbacks are provided. No external images or audio files are required because the game artwork and sound effects are drawn/generated at runtime.
