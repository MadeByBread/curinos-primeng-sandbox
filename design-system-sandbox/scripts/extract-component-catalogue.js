/**
 * Builds the component catalogue's per-component token tables by reading the
 * CSS that is actually applied.
 *
 * This inverts the old bridge extractor. That script treated a declaration file
 * as the source of truth and documented what had been declared; this one reads
 * styles/primeng/_overrides.scss and documents what each component genuinely
 * consumes. A token that stops being used disappears from the table on the next
 * run, which is the drift the old ADR-0001 was trying to prevent.
 *
 * Reads:
 *   - src/styles/primeng/_overrides.scss
 *   - src/app/pages/components/component-catalogue.manifest.json
 *
 * CSS regions are delimited with:
 *   // @component css:<cssKey>
 *   ...
 *   // @component css:/<cssKey>
 *
 * A key may open more than once — Menus covers both the popup menu and the
 * sidebar PanelMenu — and several catalogue entries may share one key, as
 * Dialog, Drawer and Popover all do.
 *
 * Writes:
 *   - src/app/pages/components/component-catalogue.generated.ts
 *
 * Usage: npm run tokens:docs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OVERRIDES_PATH = path.join(ROOT, 'src/styles/primeng/_overrides.scss');
const MANIFEST_PATH = path.join(ROOT, 'src/app/pages/components/component-catalogue.manifest.json');
const DEMO_PATH = path.join(ROOT, 'src/app/pages/components/component-demo/component-demo.component.html');
const OUTPUT_PATH = path.join(ROOT, 'src/app/pages/components/component-catalogue.generated.ts');
const INDEX_OUTPUT_PATH = path.join(ROOT, 'src/app/pages/components/component-catalogue-index.generated.ts');
const OVERRIDES_SOURCE = 'src/styles/primeng/_overrides.scss';

/** Top-of-file `$name: value;` declarations — the values with no Curinos source. */
function parseScssLiterals(scss) {
  const literals = {};
  const re = /^\$([a-z0-9-]+):\s*(.+?);\s*$/gm;
  let match;
  while ((match = re.exec(scss)) !== null) {
    literals[match[1]] = match[2].trim();
  }
  return literals;
}

function parseCssRegions(scss) {
  const regions = {};
  const lines = scss.split('\n');
  let activeKey = null;
  let activeLines = [];
  let activeStart = 0;

  const startRegex = /^\s*\/\/ @component css:([a-z0-9-]+)\s*$/;
  const endRegex = /^\s*\/\/ @component css:\/([a-z0-9-]+)\s*$/;

  lines.forEach((line, index) => {
    const endMatch = line.match(endRegex);
    if (endMatch) {
      if (activeKey !== endMatch[1]) {
        throw new Error(
          `Mismatched @component css region: closing ${endMatch[1]} while ${activeKey || 'nothing'} is open (line ${index + 1})`
        );
      }
      // Repeated keys append, so one component can own several blocks.
      regions[activeKey] = regions[activeKey]
        ? `${regions[activeKey]}\n\n${activeLines.join('\n').trim()}`
        : activeLines.join('\n').trim();
      activeKey = null;
      activeLines = [];
      return;
    }

    const startMatch = line.match(startRegex);
    if (startMatch) {
      if (activeKey) {
        throw new Error(`Nested @component css:${startMatch[1]} inside ${activeKey} (line ${index + 1})`);
      }
      activeKey = startMatch[1];
      activeStart = index + 1;
      return;
    }

    if (activeKey) {
      // The scope is interpolated in the source so its specificity lives in one
      // place; the catalogue shows the selector a reader would recognise.
      activeLines.push(line.split('#{$curinos}').join('body:not(.primeng-default)'));
    }
  });

  if (activeKey) {
    throw new Error(`Unclosed @component css:${activeKey} region (starts line ${activeStart})`);
  }

  return regions;
}

/**
 * Walk the declarations in a region and record which CSS properties consume
 * each Curinos token and each unresolved literal.
 */
function analyseRegion(css, literals) {
  const tokens = new Map();
  const usedLiterals = new Map();

  css.split('\n').forEach((line) => {
    const declaration = line.match(/^\s*([a-z-]+)\s*:\s*(.+?);\s*$/);
    if (!declaration) {
      return;
    }
    const [, property, value] = declaration;

    const tokenRe = /var\((--curinos-[a-z0-9-]+)/g;
    let match;
    while ((match = tokenRe.exec(value)) !== null) {
      if (!tokens.has(match[1])) {
        tokens.set(match[1], new Set());
      }
      tokens.get(match[1]).add(property);
    }

    const literalRe = /\$([a-z0-9-]+)/g;
    while ((match = literalRe.exec(value)) !== null) {
      if (!(match[1] in literals)) {
        continue;
      }
      if (!usedLiterals.has(match[1])) {
        usedLiterals.set(match[1], new Set());
      }
      usedLiterals.get(match[1]).add(property);
    }
  });

  const toRows = (map, build) =>
    Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, properties]) => build(name, Array.from(properties).sort()));

  return {
    tokens: toRows(tokens, (token, properties) => ({ token, properties })),
    literals: toRows(usedLiterals, (name, properties) => ({
      name: `$${name}`,
      value: literals[name],
      properties
    }))
  };
}

/**
 * The keys the demo component can render, read from its own `ngSwitch`.
 *
 * Derived rather than declared so the manifest cannot claim a demo that does
 * not exist, and so a demo cannot be orphaned by a renamed key.
 */
function parseDemoKeys(html) {
  const keys = new Set();
  const re = /\*ngSwitchCase="'([a-z0-9-]+)'"/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

/**
 * Every catalogue entry must have a demo, including the gap group — those
 * demos are how the undesigned surface is shown, not omitted.
 */
function checkDemoCoverage(manifest, demoKeys) {
  const missing = manifest.components
    .filter((component) => !demoKeys.has(component.key))
    .map((component) => component.key);
  if (missing.length) {
    throw new Error(`Catalogue entries with no demo: ${missing.join(', ')}`);
  }

  const authored = new Set(manifest.components.map((component) => component.key));
  const orphans = Array.from(demoKeys).filter((key) => !authored.has(key));
  if (orphans.length) {
    throw new Error(`Demos with no catalogue entry: ${orphans.join(', ')}`);
  }
}

function figmaRef(component, fileKey) {
  if (!component.figma) {
    return null;
  }
  const { page, nodeId } = component.figma;
  return {
    page,
    nodeId,
    url: fileKey
      ? `https://www.figma.com/design/${fileKey}/?node-id=${nodeId.replace(':', '-')}`
      : null
  };
}

function buildGroups(manifest, regions, literals, demoKeys) {
  return manifest.groups.map((group) => ({
    id: group.id,
    title: group.title,
    blurb: group.blurb,
    components: manifest.components
      .filter((component) => component.group === group.id)
      .map((component) => {
        const css = component.cssKey ? regions[component.cssKey] : null;
        const analysis = css ? analyseRegion(css, literals) : { tokens: [], literals: [] };

        return {
          key: component.key,
          name: component.name,
          status: component.status,
          approach: component.approach,
          notes: component.notes || [],
          figma: figmaRef(component, manifest.figmaFileKey),
          primeng: component.primeng,
          iframeHeight: component.iframeHeight || 0,
          hasDemo: demoKeys.has(component.key),
          // Only components with a stock PrimeNG counterpart can be compared.
          hasStockPreview: group.id === 'customized-primeng',
          css: css ? { source: OVERRIDES_SOURCE, css } : null,
          tokens: analysis.tokens,
          literals: analysis.literals
        };
      })
  }));
}

function emitTypeScript(groups) {
  return `/* eslint-disable */
// GENERATED by scripts/extract-component-catalogue.js — do not edit.
// Regenerate: npm run tokens:docs

export interface CatalogueTokenUsage {
  token: string;
  properties: string[];
}

export interface CatalogueLiteralUsage {
  name: string;
  value: string;
  properties: string[];
}

export interface CatalogueCss {
  source: string;
  css: string;
}

export interface CatalogueNote {
  title: string;
  body: string;
}

export interface CatalogueFigmaRef {
  page: string;
  nodeId: string;
  url: string | null;
}

export interface CataloguePrimeNgRef {
  selectors: string[];
  modules: string[];
}

export type CatalogueStatus = 'styled' | 'stock' | 'built' | 'planned' | 'gap';

export interface CatalogueComponent {
  key: string;
  name: string;
  status: CatalogueStatus;
  approach: string;
  notes: CatalogueNote[];
  figma: CatalogueFigmaRef | null;
  primeng: CataloguePrimeNgRef;
  iframeHeight: number;
  hasDemo: boolean;
  hasStockPreview: boolean;
  css: CatalogueCss | null;
  tokens: CatalogueTokenUsage[];
  literals: CatalogueLiteralUsage[];
}

export interface CatalogueGroup {
  id: string;
  title: string;
  blurb: string;
  components: CatalogueComponent[];
}

export const componentCatalogue: CatalogueGroup[] = ${JSON.stringify(groups, null, 2)};
`;
}

/**
 * Just enough of the catalogue to build navigation from.
 *
 * The full catalogue carries every component's CSS region and token tables and
 * runs to well over 100 kB, which is fine for the lazily-loaded catalogue page
 * but not for the sidebar, which lives in the eager layout bundle.
 */
function emitIndexTypeScript(groups) {
  const index = groups.map((group) => ({
    id: group.id,
    title: group.title,
    components: group.components.map((component) => ({
      key: component.key,
      name: component.name
    }))
  }));

  return `/* eslint-disable */
// GENERATED by scripts/extract-component-catalogue.js — do not edit.
// Regenerate: npm run tokens:docs

export interface CatalogueIndexEntry {
  key: string;
  name: string;
}

export interface CatalogueIndexGroup {
  id: string;
  title: string;
  components: CatalogueIndexEntry[];
}

export const componentCatalogueIndex: CatalogueIndexGroup[] = ${JSON.stringify(index, null, 2)};
`;
}

function main() {
  const overridesScss = fs.readFileSync(OVERRIDES_PATH, 'utf8');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const literals = parseScssLiterals(overridesScss);
  const regions = parseCssRegions(overridesScss);

  const referenced = new Set();
  manifest.components.forEach((component) => {
    if (!component.cssKey) {
      return;
    }
    if (!regions[component.cssKey]) {
      throw new Error(
        `Component "${component.key}": no @component css:${component.cssKey} region in ${OVERRIDES_SOURCE}`
      );
    }
    referenced.add(component.cssKey);
  });

  Object.keys(regions).forEach((key) => {
    if (!referenced.has(key)) {
      throw new Error(`Orphan @component css:${key} region — no catalogue entry claims it`);
    }
  });

  const demoKeys = parseDemoKeys(fs.readFileSync(DEMO_PATH, 'utf8'));
  checkDemoCoverage(manifest, demoKeys);

  const groups = buildGroups(manifest, regions, literals, demoKeys);
  const total = groups.reduce((sum, group) => sum + group.components.length, 0);

  fs.writeFileSync(OUTPUT_PATH, emitTypeScript(groups));
  fs.writeFileSync(INDEX_OUTPUT_PATH, emitIndexTypeScript(groups));
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)} (${total} components, ${Object.keys(regions).length} styled regions)`);
  console.log(`Wrote ${path.relative(ROOT, INDEX_OUTPUT_PATH)} (navigation index)`);
}

main();
