/**
 * Guards the Curinos overrides against being out-specified by nova-light.
 *
 * Loading later is not enough. nova prefixes every theme rule with `body ` and
 * often scopes with a positional class the overrides omit — `.ui-tabview-top`,
 * `.ui-treetable-tbody`, `.ui-multiselect-panel .ui-multiselect-items` — so a
 * rule that looks like it wins can silently lose. That is exactly how nova's
 * blue active tab survived an override setting the background to transparent,
 * and it fails quietly: the component just keeps its stock appearance.
 *
 * For every `ui-*` class, compare the highest specificity nova reaches against
 * the highest the overrides reach. Ties are fine — the overrides load second.
 *
 * This is a screening heuristic, not a proof. It compares per class rather than
 * per element, so a nova rule for `.ui-tabview-left` counts against a Curinos
 * rule for `.ui-tabview-top`. It over-reports rather than under-reports, which
 * is the right direction for a guard.
 *
 * Usage: npm run styles:audit
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NOVA = path.join(ROOT, 'node_modules/primeng/resources/themes/nova-light/theme.css');
const SOURCES = [
  path.join(ROOT, 'src/styles/primeng/_overrides.scss'),
  path.join(ROOT, 'src/styles/app/_layout.scss')
];
const SCOPE = path.join(ROOT, 'src/styles/primeng/_scope.scss');

function splitSelectors(list) {
  const out = [];
  let depth = 0;
  let current = '';
  for (const ch of list) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out.map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean);
}

/** [ids, classes, elements] — :not() contents count toward the total. */
function specificity(selector) {
  let ids = (selector.match(/#[\w-]+/g) || []).length;
  let classes = 0;
  let elements = 0;

  const negations = [];
  const stripped = selector.replace(/:not\(([^)]*)\)/g, (_, inner) => {
    negations.push(inner);
    return ' ';
  });

  classes += (stripped.match(/\.[\w-]+/g) || []).length;
  classes += (stripped.match(/\[[^\]]+\]/g) || []).length;
  classes += (stripped.match(/:(?!:)[a-z-]+/g) || []).length;
  elements += (stripped.match(/(?:^|[\s>+~])([a-z][\w-]*)/g) || []).length;
  elements += (stripped.match(/::[a-z-]+/g) || []).length;

  negations.forEach(inner => {
    const [i, c, e] = specificity(inner);
    ids += i;
    classes += c;
    elements += e;
  });

  return [ids, classes, elements];
}

function compare(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function collect(css) {
  const best = {};
  const re = /([^{}]+)\{/g;
  let match;
  while ((match = re.exec(css)) !== null) {
    const raw = match[1];
    if (raw.indexOf('@') !== -1 || raw.trim().charAt(0) === '$') continue;
    splitSelectors(raw).forEach(selector => {
      if (selector.indexOf('ui-') === -1) return;
      const spec = specificity(selector);
      (selector.match(/\.(ui-[\w-]+)/g) || []).forEach(raw => {
        const name = raw.slice(1);
        if (!best[name] || compare(spec, best[name]) > 0) {
          best[name] = spec;
        }
      });
    });
  }
  return best;
}

/**
 * Classes where nova's winning rule targets a descendant the overrides leave
 * alone, so the comparison is between rules that never meet. Each entry names
 * the element nova is actually painting.
 */
const NOT_STYLED = {
  'ui-tabview-top': 'ui-tabview-close'
};

function main() {
  const scopeValue = fs
    .readFileSync(SCOPE, 'utf8')
    .match(/\$curinos:\s*'([^']+)'/)[1];

  const ours = collect(
    SOURCES.map(file =>
      fs
        .readFileSync(file, 'utf8')
        .replace(/\/\/.*/g, '')
        .split('#{$curinos}')
        .join(scopeValue)
    ).join('\n')
  );
  const nova = collect(fs.readFileSync(NOVA, 'utf8'));

  const losers = Object.keys(ours)
    .sort()
    .filter(name => nova[name] && compare(nova[name], ours[name]) > 0)
    .filter(name => {
      const descendant = NOT_STYLED[name];
      if (!descendant) return true;
      // Only excusable while the overrides really do leave that element alone.
      if (ours[descendant]) {
        throw new Error(
          `.${name} is exempted because .${descendant} is unstyled, but the ` +
            'overrides now style it. Remove the NOT_STYLED entry and check the rule.'
        );
      }
      return false;
    });

  const total = Object.keys(ours).length;
  if (!losers.length) {
    console.log(
      `Specificity audit: ${total} ui-* classes styled, none out-specified by nova-light ` +
        `(${Object.keys(NOT_STYLED).length} exempt).`
    );
    return;
  }

  console.error(`Specificity audit: nova-light can out-specify ${losers.length} of ${total} styled classes.\n`);
  losers.forEach(name => {
    console.error(`  .${name.padEnd(38)} nova (${nova[name]})  vs  ours (${ours[name]})`);
  });
  console.error('\nRaise $curinos in src/styles/primeng/_scope.scss, or match nova\'s selector shape.');
  process.exit(1);
}

main();
