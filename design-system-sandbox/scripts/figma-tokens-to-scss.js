/**
 * Generates the Curinos design-token layer from Figma variable collection
 * exports.
 *
 * This generator is COLLECTION-DRIVEN: each source file is one Figma variable
 * collection, exported in the rich format (with `variables[]`, modes, and alias
 * chains). One source file maps 1:1 to one generated SCSS partial.
 *
 *   sources/curinos-colors.json       -> curinos/_color.scss       (--curinos-color-*)
 *   sources/curinos-dimensions.json   -> curinos/_dimensions.scss  (--curinos-dimensions-*)
 *   sources/curinos-effects.json      -> curinos/_effects.scss     (--curinos-effects-*)
 *   sources/curinos-typography.json   -> curinos/_typography.scss  (--curinos-typography-*)
 *
 * Inheritance is alias-driven: when a variable aliases another variable in the
 * same collection, we emit `var(--curinos-...-<alias>, <literal>)` so the token
 * graph mirrors Figma exactly, with the resolved value as a CSS fallback.
 *
 * Multi-mode collections (colors ship Light + Dark) emit two blocks: `:root`
 * for the light mode and `[data-theme="dark"]` for the dark one. The dark block
 * carries only the tokens that actually differ — a variable that aliases the
 * same target in both modes is omitted, because CSS custom properties resolve
 * at use time and it will pick up the overridden target automatically. In
 * practice that means dark overrides the palette leaves and the semantic tier
 * re-resolves for free.
 *
 * Curinos is the only token layer. There is no PrimeNG bridge: component
 * overrides in styles/primeng/_overrides.scss consume `--curinos-*` directly.
 * See docs/adr/0003-single-layer-token-architecture.md.
 *
 * Re-run: npm run tokens:build
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCES = path.join(ROOT, 'src/styles/tokens/sources');
const TOKENS = path.join(ROOT, 'src/styles/tokens');
const CURINOS_DIR = path.join(TOKENS, 'curinos');

const DARK_SELECTOR = '[data-theme="dark"]';

const COLLECTIONS = [
  { file: 'curinos-colors.json', out: '_color.scss', prefix: 'curinos-color' },
  { file: 'curinos-dimensions.json', out: '_dimensions.scss', prefix: 'curinos-dimensions' },
  { file: 'curinos-effects.json', out: '_effects.scss', prefix: 'curinos-effects' },
  { file: 'curinos-typography.json', out: '_typography.scss', prefix: 'curinos-typography' }
];

function slug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function varName(prefix, name) {
  return `--${prefix}-${slug(name)}`;
}

/**
 * Figma mode ids are opaque; resolve them by label. Light is the `:root`
 * baseline, Dark (when present) becomes the themed block.
 */
function resolveModes(collection) {
  const entries = Object.entries(collection.modes || {});
  if (!entries.length) {
    return { base: '0', dark: null };
  }
  const light = entries.find(([, label]) => /light/i.test(label));
  const dark = entries.find(([, label]) => /dark/i.test(label));
  return {
    base: (light || entries[0])[0],
    dark: dark ? dark[0] : null
  };
}

function floatColorToCss(c) {
  const ch = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  let hex = `#${ch(c.r)}${ch(c.g)}${ch(c.b)}`;
  if (c.a !== undefined && c.a < 0.999) {
    hex += ch(c.a);
  }
  return hex;
}

/** Figma exports float32, so 1.05 arrives as 1.0499999523162842. */
function trimFloat(n) {
  return String(Number(n.toFixed(4)));
}

/**
 * Numeric tokens default to px. These are the ratios and multipliers where a
 * unit would be wrong: font weights and unitless line heights.
 */
function isUnitless(name) {
  const s = slug(name);
  return (
    /^font-weight(-|$)/.test(s) ||
    /^line-height(-|$)/.test(s) ||
    /-font-weight$/.test(s) ||
    /-line-height$/.test(s)
  );
}

/**
 * Figma stores opacity on a 0-100 scale. CSS `opacity` clamps to 0-1, so
 * `opacity/90` has to land as 0.9 or every step above 1 collapses to fully
 * opaque.
 */
function isOpacity(name) {
  return /^opacity(-|$)/.test(slug(name));
}

function isFontFamilyToken(name) {
  const s = slug(name);
  return (
    /^families(-|$)/.test(s) ||
    /^(sans-serif|serif|monospace|headings|body|buttons|code|numbers)$/.test(s) ||
    /-font-family$/.test(s)
  );
}

function formatFontFamily(name, value) {
  const normalized = `${name} ${value}`.toLowerCase();
  if (/monospace|dm mono/.test(normalized)) {
    return `'${value}', monospace`;
  }
  if (/(^|\/)serif$|headings|serif pro/.test(normalized)) {
    return `'${value}', serif`;
  }
  return `'${value}', sans-serif`;
}

function formatValue(type, resolved, name) {
  if (resolved && typeof resolved === 'object' && 'r' in resolved) {
    return floatColorToCss(resolved);
  }
  if (typeof resolved === 'string') {
    if (isFontFamilyToken(name)) {
      return formatFontFamily(name, resolved);
    }
    return `'${resolved}'`;
  }
  if (type === 'STRING') {
    if (isFontFamilyToken(name)) {
      return formatFontFamily(name, String(resolved));
    }
    return `'${String(resolved)}'`;
  }
  if (type === 'FLOAT' || typeof resolved === 'number') {
    if (isOpacity(name)) {
      return trimFloat(resolved / 100);
    }
    if (isUnitless(name)) {
      return trimFloat(resolved);
    }
    return `${trimFloat(resolved)}px`;
  }
  return String(resolved);
}

function groupOf(name) {
  if (name.includes('/')) {
    return name.split('/')[0].trim();
  }
  if (name.startsWith('styles-')) {
    const match = name.match(/^(styles-(?:header-[1-4]|body|label|control))-/);
    return match ? match[1] : 'styles';
  }
  if (name.startsWith('app-')) return 'app';
  if (name.startsWith('font-weight-')) return 'font-weight';
  if (name.startsWith('line-height-')) return 'line-height';
  if (name.startsWith('letter-spacing-')) return 'letter-spacing';
  if (/^(sans-serif|serif|monospace|headings|body|buttons|code|numbers)$/.test(name)) {
    return 'families';
  }
  return name;
}

/**
 * Resolve one variable in one mode into the CSS value we would emit, keeping
 * the alias name separate so callers can tell "same alias, different literal"
 * (inert — skip in dark) from "different alias" (must be emitted).
 */
function resolveInMode(variable, modeId, prefix, siblingNames) {
  const rv = (variable.resolvedValuesByMode || {})[modeId] || {};
  const literal = formatValue(variable.type, rv.resolvedValue, variable.name);
  const alias = rv.aliasName && siblingNames.has(rv.aliasName) ? rv.aliasName : null;
  return {
    alias,
    literal,
    css: alias ? `var(${varName(prefix, alias)}, ${literal})` : literal
  };
}

function buildEntries(collection, prefix) {
  const { base, dark } = resolveModes(collection);
  const names = new Set(collection.variables.map((v) => v.name));

  return collection.variables.map((v) => {
    const light = resolveInMode(v, base, prefix, names);
    const entry = {
      name: v.name,
      group: groupOf(v.name),
      varName: varName(prefix, v.name),
      cssValue: light.css,
      darkValue: null
    };

    if (dark) {
      const night = resolveInMode(v, dark, prefix, names);
      // An alias that points at the same target in both modes re-resolves on
      // its own once the target is overridden — emitting it again would be noise.
      const inert = light.alias
        ? night.alias === light.alias
        : !night.alias && night.literal === light.literal;
      if (!inert) {
        entry.darkValue = night.css;
      }
    }

    return entry;
  });
}

function renderBlock(selector, entries, pick) {
  const groups = new Map();
  entries.forEach((e) => {
    const value = pick(e);
    if (value === null || value === undefined) {
      return;
    }
    if (!groups.has(e.group)) {
      groups.set(e.group, []);
    }
    groups.get(e.group).push({ varName: e.varName, value });
  });

  if (!groups.size) {
    return [];
  }

  const lines = [`${selector} {`];
  Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([group, items]) => {
      lines.push(`  /* ${group} */`);
      items
        .sort((a, b) => a.varName.localeCompare(b.varName))
        .forEach((e) => lines.push(`  ${e.varName}: ${e.value};`));
      lines.push('');
    });
  lines.push('}');
  return lines;
}

function writeScss(outPath, entries) {
  const lines = [
    '// Generated by scripts/figma-tokens-to-scss.js — do not edit by hand',
    '// Re-run: npm run tokens:build',
    ''
  ];

  lines.push(...renderBlock(':root', entries, (e) => e.cssValue));

  const darkLines = renderBlock(DARK_SELECTOR, entries, (e) => e.darkValue);
  if (darkLines.length) {
    lines.push('');
    lines.push(...darkLines);
  }

  lines.push('');
  fs.writeFileSync(outPath, lines.join('\n'));
  return darkLines.length ? entries.filter((e) => e.darkValue !== null).length : 0;
}

function main() {
  fs.mkdirSync(CURINOS_DIR, { recursive: true });

  let total = 0;
  let refs = 0;

  COLLECTIONS.forEach(({ file, out, prefix }) => {
    const src = path.join(SOURCES, file);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing source collection: ${src}`);
    }
    const collection = JSON.parse(fs.readFileSync(src, 'utf8'));
    const entries = buildEntries(collection, prefix);
    const darkCount = writeScss(path.join(CURINOS_DIR, out), entries);

    total += entries.length;
    refs += entries.filter((e) => e.cssValue.startsWith('var(')).length;
    const darkNote = darkCount ? `, ${darkCount} dark overrides` : '';
    console.log(`${collection.name || file}: ${entries.length} tokens${darkNote} -> curinos/${out}`);
  });

  fs.writeFileSync(
    path.join(CURINOS_DIR, '_index.scss'),
    "@import './color';\n@import './dimensions';\n@import './effects';\n@import './typography';\n"
  );

  console.log(`Total: ${total} Curinos tokens, ${refs} alias references.`);
}

main();
