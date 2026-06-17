# Domain glossary

Terms for the Curinos PrimeNG sandbox design system.

## Curinos layer

Brand design tokens (`--curinos-*`) generated from Figma collections. The foundation layer — colors, dimensions, and effects that describe the Curinos visual language. Regenerated via `npm run tokens:build` from collection exports in `tokens/sources/`.

## PrimeNG bridge

Hand-authored Layer 2 mapping from PrimeNG 7 component anatomy to Curinos tokens (`--primeng-*`). The canonical interface for how PrimeNG chrome connects to the brand layer. Transition token tables derive Curinos targets from this module at build time.

## Override layer

Global `.ui-*` CSS wiring in `_overrides.scss` that applies the bridge to stock PrimeNG 7 markup. Scoped to Curinos mode via `body:not(.primeng-default)`.

## Transition page

Side-by-side comparison demo showing stock PrimeNG 7 (nova-light) next to Curinos-customized components. Documents override approach and token mapping for each component section.

## Theme variant

Which styling mode the sandbox is in: **Curinos** (custom overrides active) or **default** (stock nova-light). Toggled via the `primeng-default` body class on default comparison routes.
