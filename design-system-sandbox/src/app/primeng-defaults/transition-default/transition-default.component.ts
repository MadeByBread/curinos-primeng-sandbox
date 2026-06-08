import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, SelectItem } from 'primeng/api';

import { phDuotone } from '../../shared/icons/phosphor-icons';

@Component({
  selector: 'app-transition-default',
  templateUrl: './transition-default.component.html',
  styleUrls: ['./transition-default.component.scss']
})
export class TransitionDefaultComponent implements OnInit, OnDestroy {
  componentKey = '';

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

  constructor(
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.document.body.classList.add('primeng-default');
    this.componentKey = this.route.snapshot.queryParamMap.get('c') || '';
    this.route.queryParamMap.subscribe(params => {
      this.componentKey = params.get('c') || '';
    });
  }

  ngOnDestroy() {
    this.document.body.classList.remove('primeng-default');
  }
}
