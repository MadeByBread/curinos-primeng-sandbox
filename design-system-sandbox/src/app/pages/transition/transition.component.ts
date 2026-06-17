import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MenuItem, SelectItem } from 'primeng/api';

import { ph, phDuotone } from '../../shared/icons/phosphor-icons';

export interface TokenMapping {
  portion: string;
  bridge: string;
  curinos: string;
}

export interface TransitionSection {
  key: string;
  title: string;
  approach: string;
  tokenMappings: TokenMapping[];
  iframeHeight: number;
  defaultPreviewUrl?: SafeResourceUrl;
}

@Component({
  selector: 'app-transition',
  templateUrl: './transition.component.html',
  styleUrls: ['./transition.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransitionComponent implements OnInit {
  products: SelectItem[] = [
    { label: 'Product A', value: 'a' },
    { label: 'Product B', value: 'b' },
    { label: 'Product C', value: 'c' }
  ];

  selectedProduct: string;

  tableRows = [
    { product: 'Personal Checking', balance: '$12,450.00', growth: '+2.4%', status: 'Active' },
    { product: 'Business Savings', balance: '$84,120.00', growth: '+1.1%', status: 'Active' },
    { product: 'CD 12-Month', balance: '$25,000.00', growth: '+0.3%', status: 'Matured' },
    { product: 'Money Market', balance: '$6,780.00', growth: '-0.2%', status: 'Active' }
  ];

  panelMenuItems: MenuItem[] = [
    {
      label: 'Overview',
      icon: phDuotone('parallelogram'),
      expanded: true,
      items: [
        { label: 'Summary', url: '#' },
        { label: 'Opportunities', url: '#' }
      ]
    },
    {
      label: 'Reporting',
      icon: phDuotone('chart-pie'),
      expanded: false,
      items: [{ label: 'Summary', url: '#' }]
    }
  ];

  sections: TransitionSection[] = [
    {
      key: 'button',
      title: 'Button',
      approach:
        'Global `.ui-button` selectors in `_overrides.scss`, scoped to `body:not(.primeng-default)`, consume Layer 2 `--primeng-button-*` tokens mapped to Curinos colors and dimensions.',
      tokenMappings: [
        {
          portion: 'Primary — background & border',
          bridge: '--primeng-button-primary-background, --primeng-button-primary-border-color',
          curinos: '--curinos-color-foreground-1'
        },
        {
          portion: 'Primary — label text',
          bridge: '--primeng-button-primary-color',
          curinos: '--curinos-color-background-1'
        },
        {
          portion: 'Primary — hover/active background & border',
          bridge: '--primeng-button-primary-hover-background, --primeng-button-primary-hover-border-color',
          curinos: '--curinos-color-semantic-primary-1'
        },
        {
          portion: 'Primary — hover/active label',
          bridge: '--primeng-button-primary-hover-color',
          curinos: '--curinos-color-foreground-1'
        },
        {
          portion: 'Secondary — border',
          bridge: '--primeng-button-secondary-border-color',
          curinos: '--curinos-color-foreground-2'
        },
        {
          portion: 'Secondary — label',
          bridge: '--primeng-button-secondary-color',
          curinos: '--curinos-color-foreground-1'
        },
        {
          portion: 'Secondary — hover background',
          bridge: '--primeng-button-secondary-hover-background',
          curinos: '--curinos-color-background-2'
        },
        {
          portion: 'Ghost — border',
          bridge: '--primeng-button-ghost-border-color',
          curinos: '--curinos-color-border-3'
        },
        {
          portion: 'Ghost — label',
          bridge: '--primeng-button-ghost-color',
          curinos: '--curinos-color-foreground-1'
        },
        {
          portion: 'Ghost — hover background & label',
          bridge: '--primeng-button-ghost-hover-background, --primeng-button-ghost-hover-color',
          curinos: '--curinos-color-background-2, --curinos-color-foreground-1'
        },
        {
          portion: 'All variants — border radius',
          bridge: '--primeng-button-border-radius',
          curinos: '--curinos-dimensions-radii-buttons'
        }
      ],
      iframeHeight: 80
    },
    {
      key: 'input',
      title: 'InputText',
      approach:
        'Single `.ui-inputtext` block in `_overrides.scss` replaces nova-light input chrome with Curinos tokens for background, border, padding, and typography.',
      tokenMappings: [
        {
          portion: 'Field background',
          bridge: '--primeng-inputtext-background',
          curinos: '--curinos-color-background-1'
        },
        {
          portion: 'Border (default)',
          bridge: '--primeng-inputtext-border-color',
          curinos: '--curinos-color-border-3'
        },
        {
          portion: 'Text',
          bridge: '--primeng-inputtext-color',
          curinos: '--curinos-color-foreground-2'
        },
        {
          portion: 'Placeholder',
          bridge: '--primeng-inputtext-placeholder-color',
          curinos: '--curinos-color-foreground-3'
        },
        {
          portion: 'Hover border',
          bridge: '--primeng-inputtext-hover-border-color',
          curinos: '--curinos-color-foreground-3'
        },
        {
          portion: 'Focus border',
          bridge: '--primeng-inputtext-focus-border-color',
          curinos: '--curinos-color-semantic-primary-1'
        },
        {
          portion: 'Border radius',
          bridge: '--primeng-inputtext-border-radius',
          curinos: '--curinos-dimensions-radii-inputs'
        }
      ],
      iframeHeight: 72
    },
    {
      key: 'dropdown',
      title: 'Dropdown',
      approach:
        'Dropdown overrides share input tokens for the closed state, then add panel-specific rules for the trigger, inner label, and popup item states.',
      tokenMappings: [
        {
          portion: 'Closed field — background, border, radius',
          bridge: '--primeng-inputtext-background, --primeng-inputtext-border-color, --primeng-inputtext-border-radius',
          curinos: '--curinos-color-background-1, --curinos-color-border-3, --curinos-dimensions-radii-inputs'
        },
        {
          portion: 'Closed field — hover/focus border',
          bridge: '--primeng-inputtext-hover-border-color, --primeng-inputtext-focus-border-color',
          curinos: '--curinos-color-foreground-3, --curinos-color-semantic-primary-1'
        },
        {
          portion: 'Placeholder label',
          bridge: '--primeng-inputtext-placeholder-color',
          curinos: '--curinos-color-foreground-3'
        },
        {
          portion: 'Selected value label',
          bridge: '--primeng-inputtext-color',
          curinos: '--curinos-color-foreground-2'
        },
        {
          portion: 'Chevron trigger icon',
          bridge: '(direct on `.ui-dropdown-trigger`)',
          curinos: '--curinos-color-foreground-3'
        },
        {
          portion: 'Panel item text',
          bridge: '--primeng-dropdown-item-color',
          curinos: '--curinos-color-foreground-2'
        },
        {
          portion: 'Panel item hover background & text',
          bridge: '--primeng-dropdown-item-hover-background, --primeng-dropdown-item-hover-color',
          curinos: '--curinos-color-background-2, --curinos-color-foreground-1'
        },
        {
          portion: 'Panel item selected background & text',
          bridge: '--primeng-dropdown-item-selected-background, --primeng-dropdown-item-selected-color',
          curinos: '--curinos-color-background-3, --curinos-color-foreground-1'
        }
      ],
      iframeHeight: 72
    },
    {
      key: 'card',
      title: 'Card',
      approach:
        'A single `.ui-card` override sets surface, border, radius, and shadow. Per-page header/body padding is handled in component SCSS (e.g. dashboard), not globally.',
      tokenMappings: [
        {
          portion: 'Surface background',
          bridge: '--primeng-card-background',
          curinos: '--curinos-color-semantic-surface-white'
        },
        {
          portion: 'Border',
          bridge: '(direct on `.ui-card`)',
          curinos: '--curinos-color-border-1'
        },
        {
          portion: 'Border radius',
          bridge: '--primeng-card-border-radius',
          curinos: '--curinos-dimensions-radii-cards'
        },
        {
          portion: 'Body text color',
          bridge: '(direct on `.ui-card`)',
          curinos: '--curinos-color-foreground-1'
        }
      ],
      iframeHeight: 140
    },
    {
      key: 'panelmenu',
      title: 'PanelMenu',
      approach:
        'The heaviest override: resets nova-light accordion chrome (blue expanded headers, gray borders) and restyles the sidebar navigation to match Figma, scoped via `.sidebar-menu.ui-panelmenu`.',
      tokenMappings: [
        {
          portion: 'Section header & item text (default)',
          bridge: '--primeng-panelmenu-item-color',
          curinos: '--curinos-color-foreground-3'
        },
        {
          portion: 'Header & item hover/active background',
          bridge: '--primeng-panelmenu-item-active-background',
          curinos: '--curinos-color-background-2'
        },
        {
          portion: 'Header hover text',
          bridge: '--primeng-panelmenu-item-hover-color',
          curinos: '--curinos-color-foreground-1'
        },
        {
          portion: 'Active submenu item text',
          bridge: '--primeng-panelmenu-item-active-color',
          curinos: '--curinos-color-foreground-1'
        },
        {
          portion: 'Expand/collapse chevron',
          bridge: '--primeng-panelmenu-icon-color',
          curinos: '--curinos-color-foreground-3'
        },
        {
          portion: 'Duotone icon active fill (::before)',
          bridge: '--primeng-panelmenu-icon-active-fill',
          curinos: '--curinos-color-semantic-primary-1'
        },
        {
          portion: 'Duotone icon active stroke (::after)',
          bridge: '--primeng-panelmenu-icon-active-stroke',
          curinos: '--curinos-color-foreground-1'
        },
        {
          portion: 'Submenu left border',
          bridge: '--primeng-panelmenu-border-color',
          curinos: '--curinos-color-border-1'
        }
      ],
      iframeHeight: 200
    },
    {
      key: 'datatable',
      title: 'DataTable',
      approach:
        'Global `.ui-table` selectors in `_overrides.scss` restyle PrimeNG 7 `p-table` chrome — header row, body cells, zebra striping, hover, and sortable column states — via Layer 2 `--primeng-table-*` tokens.',
      tokenMappings: [
        {
          portion: 'Header background',
          bridge: '--primeng-table-header-background',
          curinos: '--curinos-color-background-2'
        },
        {
          portion: 'Header text',
          bridge: '--primeng-table-header-color',
          curinos: '--curinos-color-foreground-1'
        },
        {
          portion: 'Header bottom border',
          bridge: '--primeng-table-header-border-color',
          curinos: '--curinos-color-border-1'
        },
        {
          portion: 'Body row background',
          bridge: '--primeng-table-body-background',
          curinos: '--curinos-color-semantic-surface-white'
        },
        {
          portion: 'Zebra stripe row background',
          bridge: '--primeng-table-row-stripe-background',
          curinos: '--curinos-color-background-1'
        },
        {
          portion: 'Row hover background',
          bridge: '--primeng-table-row-hover-background',
          curinos: '--curinos-color-background-2'
        },
        {
          portion: 'Cell text',
          bridge: '--primeng-table-cell-color',
          curinos: '--curinos-color-foreground-2'
        },
        {
          portion: 'Cell bottom border',
          bridge: '--primeng-table-border-color',
          curinos: '--curinos-color-border-1'
        },
        {
          portion: 'Sort icon (default)',
          bridge: '--primeng-table-sort-icon-color',
          curinos: '--curinos-color-foreground-3'
        },
        {
          portion: 'Sort icon (active column)',
          bridge: '(direct on `.ui-sortable-column.ui-state-highlight .ui-sortable-column-icon`)',
          curinos: '--curinos-color-foreground-1'
        }
      ],
      iframeHeight: 220
    }
  ];

  phHouse = ph('house');
  phSparkle = phDuotone('sparkle');
  phArrowRight = ph('arrow-right');

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.sections = this.sections.map(section => ({
      ...section,
      defaultPreviewUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
        `/transition-default?c=${section.key}`
      )
    }));
  }
}
