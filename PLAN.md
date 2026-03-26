# Globe Game — UI Improvement Plan

## Existing Features

- Random country is selected from a static list of ~250 countries
- Globe renders via MapLibre GL with a globe projection
- Globe pans/zooms to the selected country's bounding box
- All other countries are shown in green; the target country in pink
- **Reveal** button shows the country name
- **Correct** removes the country from the remaining pool and picks a new one
- **Wrong** keeps the country in the pool and picks a new one
- Remaining count is shown (`remaining X / Y`)
- Win screen shown when all countries are guessed correctly
- **Play Again** resets the game
- Settings: smooth pan toggle, scale control toggle (currently hardcoded, not exposed in UI)

---

## Phase 1 — Responsive Layout

- [x] Remove PureCSS dependency; add bespoke CSS with custom properties
- [x] `+layout.svelte`: full-viewport flex-column shell (`height: 100dvh`, no scroll)
- [x] Header strip: fixed height, title left · remaining counter right
- [x] Globe region: `flex: 1` so it fills all available space between header and button bar
- [x] Solution strip: fixed height, shows country name when revealed, placeholder when hidden
- [x] Button bar: fixed height, always visible at the bottom, buttons fill the row equally
- [x] Mobile breakpoint (`< 480px`): shrink text and button heights

---

## Phase 2 — Component Extraction

- [x] `src/lib/components/GameHeader.svelte` — title + remaining/total badge
- [x] `src/lib/components/GlobeMap.svelte` — all MapLibre / svelte-maplibre-gl code
- [x] `src/lib/components/SolutionBar.svelte` — revealed country name / hidden placeholder
- [x] `src/lib/components/ActionBar.svelte` — correct button set per game phase
- [x] `src/lib/components/WinScreen.svelte` — congrats message + Play Again button
- [x] `+page.svelte` reduced to thin orchestrator wiring state → components

---

## Phase 3 — Game Logic Extraction

- [x] `src/lib/game/gameState.svelte.ts` — Svelte 5 reactive class with all game state
  - [x] `start()`, `reveal()`, `correct()`, `wrong()`, `reset()` methods
  - [x] `remainings`, `currentCountry`, `showAll`, `won` reactive fields
- [x] `+page.svelte` uses `gameState` instance; components receive props/callbacks

---

## Phase 4 — Playwright E2E Tests

- [x] Add `playwright.config.ts` at repo root
- [x] `tests/helpers.ts` — shared 3-country fixture + `__e2e_countries__` injection pattern
- [x] `tests/initial-state.spec.ts` — page load, heading, globe, Start button, counter
- [x] `tests/game-flow.spec.ts` — Start → Reveal button appears → click Reveal → name shown → Correct/Wrong appear
- [x] `tests/correct-answer.spec.ts` — Correct → remaining count decreases, solution resets
- [x] `tests/wrong-answer.spec.ts` — Wrong → remaining count unchanged, new country loaded
- [x] `tests/win-condition.spec.ts` — exhaust all 3 test countries → win screen → Play Again resets
- [x] `tests/responsive.spec.ts` — 4 viewports: all strips visible, no overflow scroll

---

## Phase 5 — Settings Panel (stretch)

- [ ] Expose smooth pan and scale toggles in a collapsible settings panel

---

## Progress

| Phase                     | Status         |
| ------------------------- | -------------- |
| 1 — Responsive Layout     | ✅ Done        |
| 2 — Component Extraction  | ✅ Done        |
| 3 — Game Logic Extraction | ✅ Done        |
| 4 — Playwright E2E Tests  | ✅ Done        |
| 5 — Settings Panel        | ⬜ Not started |
