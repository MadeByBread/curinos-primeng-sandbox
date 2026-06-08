import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MenuItem, SelectItem } from 'primeng/api';

import { ph, phDuotone } from '../../shared/icons/phosphor-icons';

export interface TransitionSection {
  key: string;
  title: string;
  approach: string;
  straightforward: string[];
  complicated: string[];
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
      straightforward: [
        'Background, border, and text color via `--primeng-button-primary-*` tokens',
        'Border radius from `--primeng-button-border-radius`',
        'Font family (Work Sans) and label weight via `--primeng-button-label-font-weight`'
      ],
      complicated: [
        'Padding applied to nested `.ui-button-text`, not the outer button element',
        'Secondary and ghost variants use custom classes (`ui-button-secondary`, `ui-button-ghost`)',
        'Width handling: `fit-content` default vs `ui-button-full-width` and `ui-fluid` overrides'
      ],
      iframeHeight: 80
    },
    {
      key: 'input',
      title: 'InputText',
      approach:
        'Single `.ui-inputtext` block in `_overrides.scss` replaces nova-light input chrome with Curinos tokens for background, border, padding, and typography.',
      straightforward: [
        'Background and border color from `--primeng-inputtext-background` and `--primeng-inputtext-border-color`',
        'Border radius and padding from `--primeng-inputtext-border-radius` and padding tokens',
        'Placeholder color via `::placeholder` pseudo-element'
      ],
      complicated: [
        'Separate hover and focus selectors with distinct border-color tokens',
        'Focus state preserves the input shadow instead of nova-light outline',
        'Error state excluded via `:not(.ui-state-error)` to avoid conflicting with validation styles'
      ],
      iframeHeight: 72
    },
    {
      key: 'dropdown',
      title: 'Dropdown',
      approach:
        'Dropdown overrides share input tokens for the closed state, then add panel-specific rules for the trigger, inner label, and popup item states.',
      straightforward: [
        'Closed-state background, border, and radius reuse `--primeng-inputtext-*` tokens',
        'Panel item text color from `--primeng-dropdown-item-color`',
        'Hover and selected backgrounds mapped to Curinos surface tokens'
      ],
      complicated: [
        'Inner `.ui-dropdown-label.ui-inputtext` must be reset (transparent bg, no border/shadow)',
        'Trigger button (`.ui-dropdown-trigger`) styled independently with transparent background',
        'Panel item hover/selected states need `!important` to beat nova-light specificity'
      ],
      iframeHeight: 72
    },
    {
      key: 'card',
      title: 'Card',
      approach:
        'A single `.ui-card` override sets surface, border, radius, and shadow. Per-page header/body padding is handled in component SCSS (e.g. dashboard), not globally.',
      straightforward: [
        'Background from `--primeng-card-background`',
        'Border color from `--curinos-color-border-1`',
        'Border radius and box-shadow from `--primeng-card-border-radius` and `--primeng-card-shadow`'
      ],
      complicated: [
        'Global override only covers the card shell — inner padding/layout is page-specific',
        'Dashboard resets `.ui-card-header`, `.ui-card-body`, `.ui-card-content` padding to 0',
        'Per-card styleClass modifiers (e.g. `panel-hero`, `panel-stat`) add layout rules on top'
      ],
      iframeHeight: 140
    },
    {
      key: 'panelmenu',
      title: 'PanelMenu',
      approach:
        'The heaviest override: resets nova-light accordion chrome (blue expanded headers, gray borders) and restyles the sidebar navigation to match Figma, scoped via `.sidebar-menu.ui-panelmenu`.',
      straightforward: [
        'Item text and icon colors from `--primeng-panelmenu-item-color` and `--primeng-panelmenu-icon-color`',
        'Active/hover background from `--primeng-panelmenu-item-active-background`',
        'Submenu left border from `--primeng-panelmenu-border-color`'
      ],
      complicated: [
        'Accordion header chrome fully reset with `!important` on background and border',
        'Icon, label, and chevron reordered via CSS `order` property on flex children',
        'Duotone active icon uses `::before`/`::after` pseudo-elements for fill/stroke split',
        'Expand/collapse chevrons remain hardcoded PrimeIcons (`pi-chevron-right/down`) — cannot be changed via MenuItem.icon'
      ],
      iframeHeight: 200
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
