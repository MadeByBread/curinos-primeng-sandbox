# Curinos Angular 7 + PrimeNG 7 Sandbox (Dockerized)

**Live demo:** [curinos-primeng-sandbox.surge.sh](https://curinos-primeng-sandbox.surge.sh)

A fully containerized sandbox for Angular 7 + PrimeNG 7. Everything runs inside
Docker so **nothing is installed on the host machine**.

## Getting Started

The `design-system-sandbox` Angular app is already scaffolded and committed.
After cloning, install dependencies and serve from inside the Docker container.

### 1. Build the image

```bash
docker compose build
```

### 2. Enter a shell in the container

```bash
docker compose run --rm --service-ports ng bash
```

> `--service-ports` is **required**. `docker compose run` ignores the compose
> `ports:` mapping by default, so without it `localhost:4200` would be
> unreachable from the host.

### 3. Install dependencies (inside the container)

```bash
cd design-system-sandbox
npm install
```

`package.json` already pins Angular 7, PrimeNG 7, Phosphor Icons, and the rest
of the stack. You do **not** need to run `ng new` or install packages manually.

### 4. Serve

```bash
ng serve --host 0.0.0.0 --poll 2000
```

Both flags matter:

- `--host 0.0.0.0` binds the dev server to all interfaces so it is reachable
  from outside the container (otherwise it only listens on the container's
  loopback and `localhost:4200` on the host won't connect).
- `--poll 2000` enables filesystem polling. macOS bind mounts don't forward
  filesystem events into the Linux container, so hot-reload won't work without
  polling.

Then open <http://localhost:4200> on the host.

## Deploy (Surge)

Production builds run in Docker (same Node 10 toolchain as local dev). The deploy
script adds `200.html` for Angular client-side routing, then publishes
`dist/design-system-sandbox/` to Surge.

```bash
# one-time Surge login (host)
npx surge login

# build in Docker + deploy (default: curinos-primeng-sandbox.surge.sh)
cd design-system-sandbox
npm install   # host — installs surge devDependency for deploy:surge
npm run deploy:surge

# custom subdomain
SURGE_DOMAIN=my-demo.surge.sh npm run deploy:surge
```

## Setup

This repository is intentionally frozen on an old stack. A few things are
unusual compared to a typical Angular project.

### Why Docker?

On a modern Mac, Angular 7's native dependencies (`node-sass`, `node-gyp`)
cannot compile against the host's current Python and C++ toolchain. The
container is based on `node:10`, which ships Python 2.7 and the build tools
those packages expect.

> These old versions are intentional. Do **not** upgrade Angular, PrimeNG, Node,
> or Python to "fix" compatibility — the whole point is to reproduce the old
> stack.

Run `npm install` and `ng serve` **inside the container**, not on the host.
The only host-side Node usage is the token-generation script (see
[Regenerating Layer 1](#regenerating-layer-1)).

### What's already in the repo

You can start working immediately — no scaffolding step:

- **Angular app** — `design-system-sandbox/` with routing, layout, auth, and
  PrimeNG demo pages
- **Dependencies** — `package.json` / `package-lock.json` pin Angular 7,
  PrimeNG 7, PrimeIcons, `@angular/cdk@7`, and Phosphor Icons
- **Styles** — `src/styles.scss` imports Curinos tokens, PrimeNG theme CSS, and
  Phosphor webfonts
- **Animations** — `BrowserAnimationsModule` is registered in `app.module.ts`
  (required by several PrimeNG components)
- **Design tokens** — Layer 1 (Curinos) and Layer 2 (PrimeNG bridge) SCSS under
  `src/styles/tokens/`

`node_modules` is gitignored, so you still need `npm install` once per clone.

### Bind mount and hot reload

`docker-compose.yml` bind-mounts the repo into `/app` inside the container.
Edits on the host are visible in the container, but macOS does not forward
filesystem events across the mount. That is why `ng serve` needs `--poll 2000`
for live reload to work.

## Icons

This sandbox uses **Phosphor Icons** alongside **PrimeIcons**. Phosphor is the
preferred choice for new Curinos UI; PrimeIcons remain for legacy references and
PrimeNG internals that hardcode `pi pi-*` classes.

### When to use which

| Use Phosphor                         | Use PrimeIcons                                              |
| ------------------------------------ | ----------------------------------------------------------- |
| New buttons, menus, and custom UI    | Existing `pi pi-*` references not yet migrated              |
| Standalone icons via `<app-ph-icon>` | PanelMenu expand/collapse chevrons (hardcoded in PrimeNG 7) |

Browse available icons at [phosphoricons.com](https://phosphoricons.com). **Regular**
and **duotone** weights are loaded globally via `@phosphor-icons/web`.

### PrimeNG usage (CSS classes)

PrimeNG 7 passes the `icon` input as CSS classes, so Phosphor webfont classes
work directly:

```html
<button pButton label="View details" icon="ph ph-arrow-right"></button>
<button pButton label="Copilot" icon="ph-duotone ph-sparkle"></button>
```

```ts
import { ph, phDuotone } from './shared/icons/phosphor-icons';

{ label: 'Dashboard', icon: ph('house'), routerLink: ['/dashboard'] }
// → 'ph ph-house'

{ label: 'Copilot', icon: phDuotone('sparkle') }
// → 'ph-duotone ph-sparkle'
```

Duotone uses a different base class (`ph-duotone`) but the same icon name
(`ph-{name}`).

### Standalone usage (SVG component)

For custom templates where icon size, color, or stroke should follow Curinos
tokens, use the shared SVG component:

```html
<app-ph-icon name="arrow-right"></app-ph-icon>
<app-ph-icon name="key" weight="light" size="20px"></app-ph-icon>
<app-ph-icon name="sparkle" weight="duotone"></app-ph-icon>
```

SVG assets are copied from `@phosphor-icons/core` at build time into
`assets/phosphor/{weight}/`. The component applies
`--curinos-dimensions-icons-stroke` for regular and light weights.

### PanelMenu chevron caveat

PrimeNG 7 PanelMenu renders expand/collapse chevrons as hardcoded PrimeIcons
(`pi-chevron-right`, `pi-chevron-down`). These cannot be changed via
`MenuItem.icon`. Accept PrimeIcons for those two glyphs, or upgrade PrimeNG
(out of scope for this sandbox).

## Design tokens

Global CSS custom properties are organised as a **two-layer architecture**, defined
on `:root` and imported in `design-system-sandbox/src/styles.scss`.

### Two layers

| Layer                          | Prefix        | Source                                                                | Authoring         |
| ------------------------------ | ------------- | --------------------------------------------------------------------- | ----------------- |
| **Layer 1 — Curinos**          | `--curinos-*` | The three Figma **Curinos** collections (Colors, Dimensions, Effects) | **Generated**     |
| **Layer 2 — PrimeNG 7 bridge** | `--primeng-*` | Hand-curated to PrimeNG 7 component anatomy                           | **Hand-authored** |

**Layer 1 (Curinos)** is the single source of truth — the real brand foundation.
Its colors form a three-tier graph (`primitives → semantic → background/foreground/border`)
that the generator preserves via `var()` references with a literal fallback:

```css
--curinos-color-background-1: var(--curinos-color-semantic-surface-50, #fffdfa);
--curinos-color-semantic-surface-50: var(
  --curinos-color-primitives-gray-50,
  #fffdfa
);
--curinos-color-primitives-gray-50: #fffdfa;
```

**Layer 2 (PrimeNG bridge)** maps PrimeNG 7 component styling onto Layer 1.
PrimeNG 7 has **no native CSS-variable token system** (that arrived in a later
PrimeNG, which is what the Figma "Prime \*" collections describe), so this layer is
written by hand to match PrimeNG 7's `.ui-*` component anatomy and is consumed by
component overrides:

```css
--primeng-button-primary-background: var(--curinos-color-foreground-1);
--primeng-inputtext-focus-border-color: var(--curinos-color-semantic-primary-1);
--primeng-card-border-radius: var(--curinos-dimensions-radii-cards);
```

> The Figma "Prime \*" collections (Prime Primitive, Prime Component Common, …) are
> intentionally **not** mirrored — they target a newer PrimeNG token shape.

### Generation (Layer 1 only)

`scripts/figma-tokens-to-scss.js` is **collection-driven**: each source file is one
Figma collection (rich export with `variables[]`, modes, and alias chains), and maps
1:1 to one generated partial.

| Source (`tokens/sources/`)          | Collection              | Generated                  | Prefix                                              |
| ----------------------------------- | ----------------------- | -------------------------- | --------------------------------------------------- |
| `curinos-colors.json`               | Curinos Colors          | `curinos/_color.scss`      | `--curinos-color-*`                                 |
| `curinos-dimensions.json`           | Curinos Dimensions      | `curinos/_dimensions.scss` | `--curinos-dimensions-*`                            |
| `curinos-effects.json`              | Curinos Effects         | `curinos/_effects.scss`    | `--curinos-effects-*`                               |

- **Modes** — colors ship Light + Dark; only **Light** is emitted. Other collections
  are single-mode.
- **Inheritance** — alias-driven: a variable that aliases another in the same
  collection emits `var(--curinos-…-<alias>, <literal>)`.
- **Naming** — the full Figma path is slugged to kebab-case
  (`semantic/surface/50` → `--curinos-color-semantic-surface-50`).

### File structure

```
design-system-sandbox/
  src/styles/
    styles.scss                     ← imports tokens before PrimeNG
    tokens/
      _index.scss                   ← imports curinos layer, then primeng layer
      curinos/                      ← Layer 1 (GENERATED — do not edit)
        _index.scss
        _color.scss
        _dimensions.scss
        _effects.scss
      primeng/                      ← Layer 2 (HAND-AUTHORED bridge)
        _index.scss
      sources/                      ← Figma collection exports (rich format)
        curinos-colors.json
        curinos-dimensions.json
        curinos-effects.json
  scripts/
    figma-tokens-to-scss.js         ← generates Layer 1 from the collections
```

The root `tokens/_index.scss` imports `curinos` **before** `primeng` so the bridge's
`var(--curinos-*)` references resolve.

Typography (Work Sans, Source Serif Pro) and spacing are app-level values; the fonts
are loaded in `design-system-sandbox/src/index.html`. These live in the Figma
"Prime Typography" / "Prime App" collections, which are not yet exported as rich token
files, so they currently appear as literals in component styles.

### Regenerating Layer 1

Run on the **host** (Node is only needed for the script). Generated SCSS is committed
and picked up by the container via the bind mount.

1. **Export collections** — export each Curinos collection from Figma in the rich
   format and save into `design-system-sandbox/src/styles/tokens/sources/` as
   `curinos-colors.json`, `curinos-dimensions.json`, `curinos-effects.json`.
2. **Generate**

   ```bash
   cd design-system-sandbox
   npm run tokens:build
   ```

   Prints a per-collection token count and the number of alias references.

   **Scripts**

   | Script | Purpose |
   | --- | --- |
   | `npm run tokens:build` | Regenerate Layer 1 SCSS from `tokens/sources/*.json` |
   | `npm run tokens:sync:chart` | Merge Deposit Growth chart colors into `curinos-colors.json`, then run `tokens:build` |
   | `npm run tokens:docs` | Regenerate Transition token tables from the PrimeNG bridge |
   | `npm run tokens:refresh` | `tokens:build` then `tokens:docs` (after source or bridge edits) |

3. **Verify**

   ```bash
   docker compose run --rm ng bash -c "cd design-system-sandbox && npm run build"
   ```

   Or in browser devtools on any page:

   ```js
   getComputedStyle(document.documentElement).getPropertyValue(
     "--curinos-color-background-1",
   );
   // → "#fffdfa"
   ```

Restart or let `ng serve --poll 2000` pick up the updated styles if the dev server is
already running.

To extend the **PrimeNG bridge**, edit `tokens/primeng/_index.scss` by hand — point
new component variables at Curinos tokens, or use literals for component metrics that
have no Curinos equivalent.

After editing the bridge, regenerate Transition token tables:

```bash
cd design-system-sandbox
npm run tokens:docs
```

Portion labels and section metadata live in
`src/app/pages/transition/transition-sections.manifest.json`. Curinos targets are
resolved from the bridge by `scripts/extract-bridge-mappings.js`.
