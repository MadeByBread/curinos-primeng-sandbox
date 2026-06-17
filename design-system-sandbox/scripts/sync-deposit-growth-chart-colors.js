/**
 * Sync Deposit Growth chart color styles from Figma into curinos-colors.json
 * under the `data/` group, then regenerate curinos/_color.scss.
 *
 * This is a Layer 1 preprocessor — it mutates sources/curinos-colors.json, then
 * invokes figma-tokens-to-scss.js (same as npm run tokens:build). Do not edit
 * `data/*` variables by hand; re-run this script or restore from git.
 *
 * Usage:
 *   FIGMA_ACCESS_TOKEN=figd_... npm run tokens:sync:chart
 *
 * Without a token, uses `knownColors` from the manifest.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SOURCES = path.join(ROOT, 'src/styles/tokens/sources');
const CURINOS_COLORS_PATH = path.join(SOURCES, 'curinos-colors.json');
const MANIFEST_PATH = path.join(SOURCES, 'deposit-growth-chart-colors.manifest.json');
const LIGHT = '10121:1';
const DARK = '10121:2';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.slice(0, 6);
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
    a: 1
  };
}

function rgbToHex({ r, g, b, a = 1 }) {
  const ch = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  let hex = `#${ch(r)}${ch(g)}${ch(b)}`;
  if (a < 0.999) {
    hex += ch(a);
  }
  return hex.toUpperCase();
}

function figmaColorToHex(color) {
  if (!color) {
    return null;
  }
  return rgbToHex(color);
}

function httpsGet(url, token) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'X-Figma-Token': token } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Figma API ${res.statusCode}: ${data}`));
            return;
          }
          resolve(JSON.parse(data));
        });
      }
    );
    req.on('error', reject);
  });
}

function toDataVariable(name) {
  return name.replace(/^color\//, 'data/');
}

function labelToFigmaVariable(label) {
  // color.chart.categorical.05.hover -> data/chart/base/categorical-05-hover
  const parts = label.split('.');
  if (parts[0] !== 'color' || parts[1] !== 'chart') {
    return toDataVariable(label.replace(/\./g, '/'));
  }

  const rest = parts.slice(2);
  if (rest.length === 0) {
    return 'data/chart/base';
  }

  const last = rest[rest.length - 1];
  const isState = ['hover', 'active', 'disabled', 'focus', 'pressed', 'selected'].includes(last);

  if (isState && rest.length >= 2) {
    const index = rest[rest.length - 2];
    const prefix = rest.slice(0, -2).join('-');
    const group = prefix || 'categorical';
    return `data/chart/base/${group}-${index}-${last}`;
  }

  const index = rest[rest.length - 1];
  const prefix = rest.slice(0, -1).join('-');
  const group = prefix || 'categorical';
  return `data/chart/base/${group}-${index}`;
}

function findSwatchNode(node) {
  if (!node) {
    return null;
  }
  if (node.type === 'ELLIPSE' && node.fills && node.fills.length) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findSwatchNode(child);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function findLabelNode(node) {
  if (!node) {
    return null;
  }
  if (node.type === 'TEXT' && node.characters) {
    return node.characters.trim();
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findLabelNode(child);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function extractHexFromNode(doc) {
  const swatch = findSwatchNode(doc);
  if (!swatch || !swatch.fills || !swatch.fills.length) {
    return null;
  }
  const fill = swatch.fills.find((f) => f.visible !== false && f.type === 'SOLID');
  return fill ? figmaColorToHex(fill.color) : null;
}

async function fetchColorsFromFigma(manifest, token) {
  const fileKey = manifest.figmaFileKey;
  const ids = manifest.nodeIds.join(',');
  const nodesUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`;
  const variablesUrl = `https://api.figma.com/v1/files/${fileKey}/variables/local`;

  const [nodesRes, variablesRes] = await Promise.all([
    httpsGet(nodesUrl, token),
    httpsGet(variablesUrl, token).catch(() => ({ meta: { variables: {} } }))
  ]);

  const variableById = variablesRes.meta?.variables || {};
  const colors = [];

  manifest.nodeIds.forEach((nodeId) => {
    const entry = nodesRes.nodes?.[nodeId];
    if (!entry || entry.err || !entry.document) {
      return;
    }

    const doc = entry.document;
    const label = findLabelNode(doc);
    const hex = extractHexFromNode(doc);
    if (!hex) {
      return;
    }

    let figmaVariable = label ? labelToFigmaVariable(label) : null;
    const swatch = findSwatchNode(doc);
    const bound = swatch?.boundVariables?.fills?.[0]?.id;
    if (bound && variableById[bound]) {
      figmaVariable = toDataVariable(variableById[bound].name);
    }

    colors.push({
      nodeId,
      label: label || figmaVariable?.replace(/\//g, '.') || nodeId,
      figmaVariable: figmaVariable
        ? toDataVariable(figmaVariable)
        : `data/chart/base/node-${nodeId.replace(':', '-')}`,
      hex
    });
  });

  return colors;
}

function mergeColors(manifest, fetched) {
  const byNode = new Map(
    (manifest.knownColors || []).map((c) => [
      c.nodeId,
      { ...c, figmaVariable: toDataVariable(c.figmaVariable) }
    ])
  );
  (fetched || []).forEach((c) => byNode.set(c.nodeId, c));
  return manifest.nodeIds
    .map((nodeId) => byNode.get(nodeId))
    .filter(Boolean);
}

function mergeIntoCurinosColors(colors) {
  const curinos = JSON.parse(fs.readFileSync(CURINOS_COLORS_PATH, 'utf8'));

  curinos.variables = curinos.variables.filter((v) => !v.name.startsWith('data/'));

  let nextId = Math.max(...curinos.variables.map((v) => parseInt(v.id.split(':').pop(), 10))) + 1;

  colors.forEach((color) => {
    const rgb = hexToRgb(color.hex);
    const id = `VariableID:10123:${nextId++}`;
    const variable = {
      id,
      name: color.figmaVariable,
      description: color.label,
      type: 'COLOR',
      valuesByMode: {
        [LIGHT]: { ...rgb },
        [DARK]: { ...rgb }
      },
      resolvedValuesByMode: {
        [LIGHT]: { resolvedValue: { ...rgb }, alias: null },
        [DARK]: { resolvedValue: { ...rgb }, alias: null }
      },
      scopes: ['ALL_SCOPES'],
      hiddenFromPublishing: false,
      codeSyntax: {}
    };
    curinos.variables.push(variable);
  });

  curinos.variableIds = curinos.variables.map((v) => v.id);
  fs.writeFileSync(CURINOS_COLORS_PATH, JSON.stringify(curinos));
}

function buildTokensStudioJson(colors) {
  const tree = {};

  colors.forEach((color) => {
    const parts = color.figmaVariable.split('/');
    let cursor = tree;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        cursor[part] = {
          value: color.hex,
          type: 'color',
          description: color.label
        };
        return;
      }
      cursor[part] = cursor[part] || {};
      cursor = cursor[part];
    });
  });

  return {
    $metadata: {
      tokenSetOrder: ['Light']
    },
    Light: tree
  };
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const token = process.env.FIGMA_ACCESS_TOKEN;

  let fetched = [];
  if (token) {
    console.log('Fetching chart colors from Figma API...');
    fetched = await fetchColorsFromFigma(manifest, token);
    console.log(`Fetched ${fetched.length} colors from Figma.`);
  } else {
    console.warn('FIGMA_ACCESS_TOKEN not set — using knownColors from manifest only.');
  }

  const colors = mergeColors(manifest, fetched);
  if (!colors.length) {
    throw new Error('No chart colors available. Set FIGMA_ACCESS_TOKEN or add knownColors to the manifest.');
  }

  mergeIntoCurinosColors(colors);

  const tokens = buildTokensStudioJson(colors);
  fs.writeFileSync(
    path.join(SOURCES, 'deposit-growth-chart-colors.tokens.json'),
    JSON.stringify(tokens, null, 2)
  );

  execSync('node scripts/figma-tokens-to-scss.js', { cwd: ROOT, stdio: 'inherit' });

  console.log(`Merged ${colors.length} data palette colors into curinos-colors.json`);
  console.log('  sources/curinos-colors.json');
  console.log('  sources/deposit-growth-chart-colors.tokens.json (Tokens Studio sidecar)');
  console.log('  curinos/_color.scss');

  if (!token || colors.length < manifest.nodeIds.length) {
    console.warn(
      `\nOnly ${colors.length}/${manifest.nodeIds.length} colors populated. ` +
        'Open the Deposit Growth file in Figma Desktop or set FIGMA_ACCESS_TOKEN and re-run.'
    );
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
