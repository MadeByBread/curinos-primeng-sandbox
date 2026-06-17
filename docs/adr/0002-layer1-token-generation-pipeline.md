# ADR-0002: Layer 1 token generation pipeline

## Status

Accepted

## Context

Layer 1 (Curinos SCSS) is generated from Figma collection exports, but the operational seam was tribal knowledge: `node scripts/figma-tokens-to-scss.js` in README prose only, no npm script, and chart colors merged through a separate script that mutates `curinos-colors.json` in place.

Without a documented pipeline, Layer 1 could not be trusted before expanding Layer 2 bridge work (ADR-0001 depends on stable `--curinos-*` targets).

## Decision

1. **`npm run tokens:build`** is the canonical entry point for Layer 1 regeneration (`figma-tokens-to-scss.js`). One Figma collection JSON → one generated partial; sources live in `tokens/sources/`.
2. **Chart data palette sync is an explicit preprocessor**, not a fourth collection: `npm run tokens:sync:chart` merges `data/*` variables into `curinos-colors.json`, then invokes the same generator. Do not hand-edit `data/*` entries.
3. **`npm run tokens:docs`** remains separate (Transition registry from bridge SCSS, ADR-0001).
4. **`npm run tokens:refresh`** runs `tokens:build` then `tokens:docs` after source or bridge edits.

## Consequences

- Regeneration commands are discoverable from `package.json` and README.
- Chart sync side-path is documented; it no longer looks like an ad-hoc exception.
- CI or pre-commit can hook `tokens:build` / `tokens:docs` later without inventing new entry points.

## Alternatives considered

- **Single `tokens:all` including chart sync:** Rejected — chart sync requires `FIGMA_ACCESS_TOKEN` and mutates colors; should not run on every build.
- **Fourth collection file for chart colors:** Rejected — chart colors share the Curinos Colors collection namespace in Figma re-import; merge into `curinos-colors.json` keeps one export surface.
