import { Component, ViewEncapsulation } from '@angular/core';

import { StepperStep } from '../../shared/stepper/stepper.component';

interface ProcessPanel {
  title: string;
  body: string;
  command?: string;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent {
  readonly processSteps: StepperStep[] = [
    { label: 'Export', hint: 'From Figma' },
    { label: 'Generate', hint: 'tokens:build' },
    { label: 'Style', hint: 'Write the CSS' },
    { label: 'Read back', hint: 'tokens:docs' }
  ];

  processIndex = 0;

  readonly processPanels: ProcessPanel[] = [
    {
      title: 'Export the four collections',
      body: 'From Figma, export Colors, Dimensions, Effects and Typography in the rich variable format. Drop the JSON on the existing files in tokens/sources/. That is the only input. There is no second collection for PrimeNG, and no component-token file.'
    },
    {
      title: 'Generate the CSS variables',
      body: 'The generator writes one SCSS partial per collection. Light values land on :root; dark values land on [data-theme="dark"], and only where the alias actually changes. Component CSS reads --curinos-* directly — the old --primeng-* bridge is gone.',
      command: 'npm run tokens:build'
    },
    {
      title: 'Spend the tokens on stock markup',
      body: 'Open _overrides.scss, find or add a // @component css:<key> region, and write global .ui-* rules. Do not wrap the PrimeNG component and do not fork its template. Values that have no Curinos source stay as named literals at the top of the file. New components (Chip, Avatar, Stepper) consume the same variables in their own stylesheets.'
    },
    {
      title: 'Let the catalogue read the CSS',
      body: 'The token table under each catalogue entry is parsed from that component\'s override region. A token that stops being applied disappears on the next run. styles:audit then checks that nova-light cannot out-specify any of those rules.',
      command: 'npm run tokens:docs && npm run styles:audit'
    }
  ];

  readonly buttonExample = `.ui-button.ui-state-default {
  height: var(--curinos-dimensions-controls-sizing-md);
  background: var(--curinos-color-foreground-1);
  color: var(--curinos-color-background-1);
}

.ui-button.ui-state-default.ui-button-success {
  background: var(--curinos-color-semantic-success-1);
  border-color: var(--curinos-color-semantic-success-1);
}`;

  get processPanel(): ProcessPanel {
    return this.processPanels[this.processIndex];
  }
}
