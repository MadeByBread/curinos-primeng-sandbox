# Angular 7 + PrimeNG 7 Sandbox (Dockerized)

A fully containerized sandbox for Angular 7 + PrimeNG 7. Everything runs inside
Docker so **nothing is installed on the host machine**.

## Why Docker?

On a modern Mac (macOS 26), Angular 7's native dependencies (`node-sass`,
`node-gyp`) cannot compile against the host's Python 3.13 toolchain. The
container is based on `node:10`, which ships Python 2.7 and the C/C++ build
toolchain those packages expect.

> These old versions are intentional. Do **not** upgrade Angular, PrimeNG, Node,
> or Python to "fix" compatibility — the whole point is to reproduce the old
> stack.

## Files

```
./Dockerfile
./docker-compose.yml
./README.md
./design-system-sandbox/          (Angular app — scaffolded inside the container)
  src/styles/tokens/              (Curinos CSS variables — see below)
  scripts/figma-tokens-to-scss.js (regenerates token SCSS from Figma JSON)
```

## Workflow

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

### 3. Scaffold and install (inside the container)

The Angular project is created interactively (it has prompts), so it is **not**
scaffolded for you. Run this inside the container shell:

```bash
ng new design-system-sandbox
cd design-system-sandbox
npm install primeng@7 primeicons@1 @angular/cdk@7 @phosphor-icons/web @phosphor-icons/core
```

### 4. Styles

`design-system-sandbox/src/styles.scss` should import Curinos tokens first, then
PrimeNG (this is already set up in the repo):

```scss
@import 'styles/tokens/index';

@import "~primeng/resources/themes/nova-light/theme.css";
@import "~primeng/resources/primeng.min.css";
@import "~primeicons/primeicons.css";
@import "~@phosphor-icons/web/src/regular/style.css";
@import 'styles/icons/phosphor';
```

### 5. Enable animations

`app.module.ts` needs `BrowserAnimationsModule` imported from
`@angular/platform-browser/animations`. Without it, several PrimeNG components
throw at runtime.

```ts
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    // ...
    BrowserAnimationsModule,
  ],
})
export class AppModule {}
```

### 6. Serve

```bash
cd design-system-sandbox
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

## Icons

This sandbox uses **Phosphor Icons** alongside **PrimeIcons**. Phosphor is the
preferred choice for new Curinos UI; PrimeIcons remain for legacy references and
PrimeNG internals that hardcode `pi pi-*` classes.

### When to use which

| Use Phosphor | Use PrimeIcons |
|--------------|----------------|
| New buttons, menus, and custom UI | Existing `pi pi-*` references not yet migrated |
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

| Layer | Prefix | Source | Authoring |
|-------|--------|--------|-----------|
| **Layer 1 — Curinos** | `--curinos-*` | The three Figma **Curinos** collections (Colors, Dimensions, Effects) | **Generated** |
| **Layer 2 — PrimeNG 7 bridge** | `--primeng-*` | Hand-curated to PrimeNG 7 component anatomy | **Hand-authored** |

**Layer 1 (Curinos)** is the single source of truth — the real brand foundation.
Its colors form a three-tier graph (`primitives → semantic → background/foreground/border`)
that the generator preserves via `var()` references with a literal fallback:

```css
--curinos-color-background-1: var(--curinos-color-semantic-surface-50, #fffdfa);
--curinos-color-semantic-surface-50: var(--curinos-color-primitives-gray-50, #fffdfa);
--curinos-color-primitives-gray-50: #fffdfa;
```

**Layer 2 (PrimeNG bridge)** maps PrimeNG 7 component styling onto Layer 1.
PrimeNG 7 has **no native CSS-variable token system** (that arrived in a later
PrimeNG, which is what the Figma "Prime \*" collections describe), so this layer is
written by hand to match PrimeNG 7's `.ui-*` component anatomy and is consumed by
component overrides:

```css
--primeng-button-primary-background: var(--curinos-color-foreground-1);
--primeng-inputtext-focus-border-color: var(--curinos-color-primitives-yellow-400);
--primeng-card-border-radius: 4px; /* component metric, no Curinos equivalent */
```

> The Figma "Prime \*" collections (Prime Primitive, Prime Component Common, …) are
> intentionally **not** mirrored — they target a newer PrimeNG token shape.

### Generation (Layer 1 only)

`scripts/figma-tokens-to-scss.js` is **collection-driven**: each source file is one
Figma collection (rich export with `variables[]`, modes, and alias chains), and maps
1:1 to one generated partial.

| Source (`tokens/sources/`) | Collection | Generated | Prefix |
|----------------------------|------------|-----------|--------|
| `curinos-colors.json` | Curinos Colors | `curinos/_color.scss` | `--curinos-color-*` |
| `curinos-dimensions.json` | Curinos Dimensions | `curinos/_dimensions.scss` | `--curinos-dimensions-*` |
| `curinos-effects.json` | Curinos Effects | `curinos/_effects.scss` | `--curinos-effects-*` |

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
   node scripts/figma-tokens-to-scss.js
   ```

   Prints a per-collection token count and the number of alias references.
3. **Verify**

   ```bash
   docker compose run --rm ng bash -c "cd design-system-sandbox && npm run build"
   ```

   Or in browser devtools on any page:

   ```js
   getComputedStyle(document.documentElement)
     .getPropertyValue('--curinos-color-background-1')
   // → "#fffdfa"
   ```

Restart or let `ng serve --poll 2000` pick up the updated styles if the dev server is
already running.

To extend the **PrimeNG bridge**, edit `tokens/primeng/_index.scss` by hand — point
new component variables at Curinos tokens, or use literals for component metrics that
have no Curinos equivalent.
# curinos-primeng-sandbox
