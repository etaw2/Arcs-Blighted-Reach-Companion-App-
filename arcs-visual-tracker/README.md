# Arcs Visual Tracker

A small React + TypeScript + Zustand prototype for tracking Arcs game state.

## What is included

- Visual main board image with clickable hotspots for 6 gates and 18 planets
- Side panel editor for the selected gate or planet
- Player board images for blue, red, yellow, and white
- Editable player counters for power, ships, cities, starports, favors, trophies, captives, resources, initiative, flagship, fate, and outrage
- Zustand store with immutable game-state updates
- Blight modeled as an integer count

## Run locally

```bash
npm install
npm run dev
```

## Notes

- Hotspot positions on the main board are approximate and can be tuned further.
- Court / rules / scrap data is in the state model and store, but there is not a visible UI for those sections yet.
- Buildings currently add as neutral `free` buildings from the editor panel.
