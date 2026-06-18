/**
 * Copies only Phosphor SVG assets referenced by <app-ph-icon> in templates.
 * Font icons (ph(), phDuotone()) are unchanged — they use webfont files only.
 *
 * Re-run: npm run icons:copy (also runs automatically via prebuild)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(SRC, 'assets', 'phosphor');
const CORE = path.join(ROOT, 'node_modules', '@phosphor-icons/core/assets');

const WEIGHT_SUFFIX = {
  light: '-light',
  thin: '-thin',
  bold: '-bold',
  fill: '-fill',
  duotone: '-duotone'
};

function rmrf(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.lstatSync(full).isDirectory()) {
      rmrf(full);
    } else {
      fs.unlinkSync(full);
    }
  }
  fs.rmdirSync(dir);
}

function findHtmlFiles(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      findHtmlFiles(full, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function parseIconUsages() {
  const icons = [];
  const tagPattern = /<app-ph-icon\b([^>]*)\/?>/g;
  const attrPattern = /(\w+)=["']([^"']+)["']/g;

  for (const file of findHtmlFiles(SRC, [])) {
    const content = fs.readFileSync(file, 'utf8');
    let tagMatch;

    while ((tagMatch = tagPattern.exec(content)) !== null) {
      const attrs = tagMatch[1];
      const parsed = {};
      let attrMatch;

      while ((attrMatch = attrPattern.exec(attrs)) !== null) {
        parsed[attrMatch[1]] = attrMatch[2];
      }

      if (parsed.name) {
        icons.push({
          name: parsed.name,
          weight: parsed.weight || 'regular'
        });
      }
    }
  }

  return icons;
}

function svgFilename(name, weight) {
  const suffix = WEIGHT_SUFFIX[weight] || '';
  return `${name}${suffix}.svg`;
}

function main() {
  if (!fs.existsSync(CORE)) {
    console.warn('copy-phosphor-icons: @phosphor-icons/core not installed, skipping');
    return;
  }

  const icons = parseIconUsages();

  rmrf(OUT);

  if (icons.length === 0) {
    console.log('copy-phosphor-icons: no <app-ph-icon> usages found');
    return;
  }

  const seen = new Set();
  const unique = icons.filter((icon) => {
    const key = `${icon.weight}:${icon.name}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  let copied = 0;

  for (const { name, weight } of unique) {
    const filename = svgFilename(name, weight);
    const srcPath = path.join(CORE, weight, filename);
    const destDir = path.join(OUT, weight);
    const destPath = path.join(destDir, filename);

    if (!fs.existsSync(srcPath)) {
      console.error(`copy-phosphor-icons: missing source file ${srcPath}`);
      process.exit(1);
    }

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    copied++;
  }

  console.log(`copy-phosphor-icons: copied ${copied} SVG(s) into src/assets/phosphor`);
}

main();
