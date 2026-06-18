import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-curinos-tokens',
  templateUrl: './curinos-tokens.component.html',
  styleUrls: ['./curinos-tokens.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CurinosTokensComponent {
  readonly figmaExportSnippet = `{
  "name": "Curinos Colors",
  "modes": { "10121:1": "Light", "10121:2": "Dark" },
  "variables": [{
    "name": "semantic/danger/2",
    "type": "COLOR",
    "resolvedValuesByMode": {
      "10121:1": {
        "resolvedValue": { "r": 0.996, "g": 0.886, "b": 0.886, "a": 1 },
        "aliasName": "primitives/red/100"
      }
    }
  }]
}`;

  readonly aliasChainSnippet = `--curinos-color-background-1: var(--curinos-color-semantic-surface-50, #fffdfa);
--curinos-color-semantic-surface-50: var(--curinos-color-primitives-gray-50, #fffdfa);
--curinos-color-primitives-gray-50: #fffdfa;`;

  readonly outputTreeSnippet = `src/styles/tokens/
  sources/           ← Figma exports (committed)
  curinos/           ← GENERATED — do not edit
    _index.scss
    _color.scss
    _dimensions.scss
    _effects.scss
    _typography.scss`;

  readonly usageSnippet = `.my-element {
  color: var(--curinos-color-foreground-1);
  border-radius: var(--curinos-dimensions-radii-cards);
}`;

  readonly devtoolsSnippet = `getComputedStyle(document.documentElement)
  .getPropertyValue('--curinos-color-background-1');`;

  readonly regenerateSnippet = `cd design-system-sandbox
npm run tokens:build`;
}
