# ADR-0001: Bridge SCSS as source of truth for Transition token docs

## Status

Accepted

## Context

The Transition page maintained ~300 lines of hand-authored `TokenMapping[]` data in TypeScript. This registry was shallow — deleting rows broke documentation but not styling — and drifted from the PrimeNG bridge (`tokens/primeng/_index.scss`) and override bypasses within weeks of each edit.

Examples of drift: README examples used different Curinos tokens than the bridge; dropdown chevron and card border mappings documented direct Layer 1 reach-throughs that were not modeled in the bridge interface.

## Decision

1. **`tokens/primeng/_index.scss` is the canonical mapping interface** for bridge → Curinos token relationships.
2. **Portion labels and demo metadata** live in `transition-sections.manifest.json` (human anatomy labels, approach prose, iframe heights, section notes).
3. **`scripts/extract-bridge-mappings.js` runs at build/doc time** (via `npm run tokens:docs`) and emits `bridge-mappings.generated.ts`, resolving Curinos targets from bridge declarations. The Transition page imports generated data only.
4. **Override bypasses must gain bridge aliases** before they appear in Transition tables — no documenting direct `--curinos-*` reach-through as permanent exceptions unless the bridge cannot express the property (e.g. pseudo-element wiring described in section notes).

## Consequences

- Editing a bridge mapping and running `npm run tokens:docs` updates Transition tables automatically.
- The manifest must reference bridge variable names that exist in `_index.scss`; the extractor fails fast on unknown names.
- Literal bridge values (shadows, paddings) appear in the Curinos column as literals — accurate, since they have no Curinos equivalent.
- PanelMenu expand-icon CSS swap remains a section note, not a fake bridge row.

## Alternatives considered

- **YAML-only manifest (Option B):** Reintroduces a second file to keep bridge values in sync; rejected.
- **Annotated SCSS comments (Option C):** Couples parser to comment syntax; rejected for sandbox simplicity.
- **Keep hand-maintained TS:** Already proven to drift; rejected.
