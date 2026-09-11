import { Component, ViewEncapsulation } from '@angular/core';

interface Swatch {
  name: string;
  variable: string;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent {
  readonly swatches: Swatch[] = [
    { name: 'background-1', variable: '--curinos-color-background-1' },
    { name: 'foreground-1', variable: '--curinos-color-foreground-1' },
    { name: 'background-3', variable: '--curinos-color-background-3' },
    { name: 'border-3', variable: '--curinos-color-border-3' },
    { name: 'primary', variable: '--curinos-color-semantic-primary-1' },
    { name: 'success', variable: '--curinos-color-semantic-success-1' },
    { name: 'warning', variable: '--curinos-color-semantic-warning-1' },
    { name: 'danger', variable: '--curinos-color-semantic-danger-1' }
  ];

  readonly radii: Swatch[] = [
    { name: 'buttons · 2px', variable: '--curinos-dimensions-radii-semantic-buttons' },
    { name: 'inputs · 2px', variable: '--curinos-dimensions-radii-semantic-inputs' },
    { name: 'cards · 4px', variable: '--curinos-dimensions-radii-semantic-cards' },
    { name: 'lg · 8px', variable: '--curinos-dimensions-radii-lg' }
  ];

  readonly consumeSnippet = `.panel {
  background: var(--curinos-color-background-1);
  color: var(--curinos-color-foreground-1);
}`;

  readonly conventionVars = `--curinos-color-background-1: var(--curinos-color-semantic-surface-white);
--curinos-color-foreground-1: var(--curinos-color-semantic-surface-950);`;

  readonly conventionUsage = `.panel {
  background: var(--curinos-color-background-1);
  color: var(--curinos-color-foreground-1);
}`;

  readonly radiusSnippet = `--curinos-dimensions-radii-semantic-buttons: 2px;
--curinos-dimensions-radii-semantic-inputs: 2px;
--curinos-dimensions-radii-semantic-cards: 4px;
--curinos-dimensions-radii-lg: 8px;`;

  readonly buttonExample = `.ui-button.ui-state-default {
  height: var(--curinos-dimensions-controls-sizing-md);
  background: var(--curinos-color-foreground-1);
  color: var(--curinos-color-background-1);
}

.ui-button.ui-state-default.ui-button-success {
  background: var(--curinos-color-semantic-success-1);
  border-color: var(--curinos-color-semantic-success-1);
}`;
}
