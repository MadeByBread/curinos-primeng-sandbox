import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MenuItem, SelectItem } from 'primeng/api';

import { ph, phDuotone } from '../../shared/icons/phosphor-icons';
import {
  GeneratedIconMapping,
  GeneratedTokenMapping,
  GeneratedTransitionNote,
  generatedTransitionData
} from './bridge-mappings.generated';

export interface TokenMapping extends GeneratedTokenMapping {}

export interface TransitionSection {
  key: string;
  title: string;
  approach: string;
  tokenMappings: TokenMapping[];
  notes: GeneratedTransitionNote[];
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

  iconMappings: GeneratedIconMapping[] = generatedTransitionData.iconMappings;

  sections: TransitionSection[] = generatedTransitionData.sections.map(section => ({
    ...section,
    defaultPreviewUrl: undefined
  }));

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
