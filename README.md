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

If you have a container that's already running, you can enter it with:
```bash
docker compose exec ng bash
```

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

## Deployment

Production builds run in Docker (same Node 10 toolchain as local dev), then publish
the static output to [Surge](https://surge.sh). The deploy script adds `200.html` for
Angular client-side routing before uploading `dist/design-system-sandbox/`.

**Live demo:** [curinos-primeng-sandbox.surge.sh](https://curinos-primeng-sandbox.surge.sh)

### Prerequisites

- Docker (same setup as [Getting Started](#getting-started))
- A [Surge](https://surge.sh) account (free tier is fine)

### 1. Build the Docker image

Skip this if you already ran it for local development.

```bash
docker compose build
```

### 2. Log in to Surge (one-time, on the host)

```bash
npx surge login
```

Surge stores credentials locally after this step.

### 3. Install host dependencies

The deploy script runs from the host and invokes Docker for the build. Install
dependencies once so `npm run deploy:surge` is available:

```bash
cd design-system-sandbox
npm install
```

> Host-side Node is only used to run the deploy script and Surge CLI — the Angular
> production build still runs inside the container.

### 4. Deploy

```bash
npm run deploy:surge
```

This runs `scripts/deploy-surge.sh`, which:

1. Builds the production bundle in Docker (`npm run build -- --prod`)
2. Copies `index.html` → `200.html` (SPA fallback for client-side routes)
3. Publishes `dist/design-system-sandbox/` to the default domain

Default URL: <https://curinos-primeng-sandbox.surge.sh>

### 5. Deploy to a custom subdomain (optional)

```bash
SURGE_DOMAIN=my-demo.surge.sh npm run deploy:surge
```

Pick any unclaimed `*.surge.sh` subdomain, or use a custom domain you have configured
in Surge.

### Troubleshooting

| Problem | Fix |
| --- | --- |
| `Build output not found` | Ensure Docker is running and `docker compose build` succeeded |
| Surge auth error | Re-run `npx surge login` |
| 404 on deep links | Confirm `200.html` exists in the build output (the script adds it automatically) |
| Build fails in Docker | Same fixes as local dev — run builds inside the container, not on the host |

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
- **Design tokens** — Curinos SCSS under `src/styles/tokens/`, generated from
  Figma collection exports

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

Global CSS custom properties live on `:root`, imported by
`design-system-sandbox/src/styles.scss`. There is **one** token layer: `--curinos-*`,
generated from Figma. Component overrides consume it directly.

An earlier version of this repo had a second hand-authored layer (`--primeng-*`) that
mapped Curinos onto PrimeNG 7 component anatomy. It was deleted — 53 of its 84 tokens
were one-hop pass-throughs and 27 were nova-light literals wearing Curinos names. See
[ADR-0003](docs/adr/0003-single-layer-token-architecture.md).

### Generation

`scripts/figma-tokens-to-scss.js` is **collection-driven**: each source file is one Figma
collection (rich export with `variables[]`, modes, and alias chains), and maps 1:1 to one
generated partial.

| Source (`tokens/sources/`) | Collection         | Generated                  | Prefix                     |
| -------------------------- | ------------------ | -------------------------- | -------------------------- |
| `curinos-colors.json`      | Curinos Colors     | `curinos/_color.scss`      | `--curinos-color-*`        |
| `curinos-dimensions.json`  | Curinos Dimensions | `curinos/_dimensions.scss` | `--curinos-dimensions-*`   |
| `curinos-effects.json`     | Curinos Effects    | `curinos/_effects.scss`    | `--curinos-effects-*`      |
| `curinos-typography.json`  | Curinos Typography | `curinos/_typography.scss` | `--curinos-typography-*`   |

- **Inheritance** — a variable that aliases another in the same collection emits
  `var(--curinos-…-<alias>, <literal>)`, mirroring the Figma graph with the resolved
  value as a CSS fallback.
- **Naming** — the full Figma path is slugged to kebab-case
  (`semantic/surface/50` → `--curinos-color-semantic-surface-50`).
- **Units** — floats become `px` except font weights and line heights. Figma stores
  opacity 0-100, so `opacity/90` is rescaled to `0.9`; CSS `opacity` clamps at 1 and
  every step would otherwise collapse to fully opaque.

### Light and dark

Colors ship both modes. Light fills `:root`; dark fills `[data-theme="dark"]`.

The dark block carries only the tokens that genuinely differ. A variable that aliases the
same target in both modes is omitted, because custom properties resolve at use time and
it picks up the overridden target on its own. In practice dark overrides the palette
leaves and the semantic tier re-resolves for free — currently 119 overrides out of 372
color tokens.

One consequence worth knowing: Figma swaps semantic tiers 2 and 3 between modes. In light,
`semantic/danger/2` is the pale tint and `/3` the deep ink; in dark they trade places. So
"tier 2 is the surface, tier 3 is the text on it" holds in both themes without a
mode-specific rule.

### Regenerating

Run on the **host** — Node is only needed for the script. Generated SCSS is committed and
picked up by the container through the bind mount.

1. **Export collections** — export each Curinos collection from Figma in the rich format
   into `design-system-sandbox/src/styles/tokens/sources/`, using the exact filenames in
   the table above.
2. **Generate**

   ```bash
   cd design-system-sandbox
   npm run tokens:refresh
   ```

   | Script                  | Purpose                                                     |
   | ----------------------- | ----------------------------------------------------------- |
   | `npm run tokens:build`  | Regenerate token SCSS from `tokens/sources/*.json`          |
   | `npm run tokens:docs`   | Regenerate catalogue token tables from `_overrides.scss`    |
   | `npm run tokens:refresh`| Both, in order                                              |

3. **Verify**

   ```bash
   docker compose run --rm ng bash -c "cd design-system-sandbox && npm run build"
   ```

   Or in browser devtools on any page:

   ```js
   getComputedStyle(document.documentElement).getPropertyValue(
     "--curinos-color-background-1",
   );
   ```

## Component catalogue

`/components` lists every component in the design system, grouped into **Customized
PrimeNG** (stock PrimeNG 7 restyled through `.ui-*` overrides) and **New components**
(no PrimeNG 7 counterpart, authored here).

Figma page names are canonical and the PrimeNG selector is shown as the implementation.
Where they disagree, Figma wins: the catalogue says **Drawer** for `p-sidebar` and
**Popover** for `p-overlayPanel`, which leaves "sidebar" free to mean only the app
navigation shell.

The mapping is many-to-many in both directions. Figma models each button size as its own
component and they collapse to one `.ui-button` with a size class; Figma's single **Menus**
page fans out to seven PrimeNG components.

Each entry can reveal a stock PrimeNG preview, off by default. Both sides render the same
`app-component-demo` markup — the iframe route just adds `primeng-default` to `<body>`,
which every rule in `_overrides.scss` is scoped against. Any visible difference is
styling, never markup.

### Adding a component

1. Write the override rules in `styles/primeng/_overrides.scss`, wrapped in
   `// @component css:<key>` / `// @component css:/<key>`. A key may open more than once,
   and several entries may share one key.
2. Add an entry to `src/app/pages/components/component-catalogue.manifest.json`.
3. Add a demo case to `component-demo.component.html`, keyed on the component key.
4. Run `npm run tokens:docs`.

Token tables are not authored. `scripts/extract-component-catalogue.js` reads the
`var(--curinos-*)` usage out of each region, so a token that stops being used disappears
from the table on the next run. The script fails on a manifest entry pointing at a missing
region, and on a region no entry claims.
