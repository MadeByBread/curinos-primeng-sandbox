import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Stock PrimeNG preview loaded in an iframe by the component catalogue.
 *
 * Adds `primeng-default` to <body>, which is what every rule in
 * _overrides.scss is scoped against, so nova-light shows through. The demo
 * markup itself is the same component the catalogue renders — only the styling
 * differs.
 */
@Component({
  selector: 'app-component-default',
  templateUrl: './component-default.component.html',
  styleUrls: ['./component-default.component.scss']
})
export class ComponentDefaultComponent implements OnInit, OnDestroy {
  componentKey = '';

  constructor(
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.document.body.classList.add('primeng-default');
    this.route.queryParamMap.subscribe(params => {
      this.componentKey = params.get('c') || '';
    });
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('primeng-default');
  }
}
