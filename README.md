# NEON RUSH

A single-player arcade survival game built with HTML5 Canvas, CSS, and vanilla JavaScript.

## Play

Open the game link in a modern browser:

**Game link:** https://neon-rush-spacegame.netlify.app

No Python server, installation, account, or backend is required. Click **INITIATE RUN** to play.

## Controls

- **WASD / Arrow keys:** Move
- **P / Escape:** Pause
- **Touch / pointer:** Drag to steer on touchscreens

## Gameplay

- Avoid incoming asteroids.
- Collect cyan energy orbs to evolve the ship and upgrade its auto-targeting guns.
- Collect purple shield pickups for temporary protection.
- Alien ships arrive after 30 seconds. Chargers, snipers, and armored enemies require different tactics.
- A boss ship appears after two minutes and returns later with increased health.
- Survive longer as the threat index increases. You have three hull points.
- Personal best and settings are stored in browser local storage.

## Project structure

- `index.html` — screens and interface
- `css/style.css` — visual design and responsive layout
- `js/game.js` — canvas game loop, entities, movement, collisions, and scoring
- `js/audio.js` — generated sound effects using Web Audio
- `js/main.js` — screen navigation and UI wiring

The game needs no external images or audio files. Its artwork and sound effects are drawn or generated at runtime. Google Fonts are an optional enhancement; system font fallbacks are provided.
