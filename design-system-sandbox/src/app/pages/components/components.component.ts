import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import {
  CatalogueComponent,
  CatalogueGroup,
  componentCatalogue
} from './component-catalogue.generated';

interface CatalogueEntry extends CatalogueComponent {
  stockPreviewUrl?: SafeResourceUrl;
}

interface CatalogueSection extends CatalogueGroup {
  components: CatalogueEntry[];
}

const STATUS_LABELS: { [key: string]: string } = {
  styled: 'Curinos styled',
  stock: 'Not yet styled',
  built: 'Built here',
  planned: 'Planned',
  gap: 'No design'
};

@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ComponentsComponent implements OnInit, OnDestroy {
  section: CatalogueSection;

  /**
   * Which disclosure panels are open, keyed `<component>:<panel>`.
   *
   * Everything past the preview is collapsed by default: an entry should read
   * as a name, a sentence and a rendering, with the reference material a click
   * away rather than stacked underneath.
   */
  private openPanels: { [id: string]: boolean } = {};
  private sections: CatalogueSection[] = [];
  private routeSub: Subscription;
  private querySub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private host: ElementRef
  ) {}

  ngOnInit(): void {
    this.sections = componentCatalogue.map(group => ({
      ...group,
      components: group.components.map(component => ({
        ...component,
        stockPreviewUrl: component.hasStockPreview
          ? this.sanitizer.bypassSecurityTrustResourceUrl(`/components-default?c=${component.key}`)
          : undefined
      }))
    }));

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('group');
      this.section = this.sections.filter(group => group.id === id)[0] || this.sections[0];
      this.openPanels = {};
    });

    // Sidebar submenu entries address a single component with ?c=, because
    // PrimeNG 7 menu items cannot carry a router fragment.
    this.querySub = this.route.queryParamMap.subscribe(params => {
      this.scrollToComponent(params.get('c'));
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.querySub) {
      this.querySub.unsubscribe();
    }
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  }

  isOpen(key: string, panel: string): boolean {
    return this.openPanels[`${key}:${panel}`] === true;
  }

  togglePanel(key: string, panel: string): void {
    const id = `${key}:${panel}`;
    this.openPanels[id] = !this.openPanels[id];
  }

  private scrollToComponent(key: string): void {
    if (!key) {
      return;
    }

    // Arriving from another group, the cards for this one have not rendered yet.
    setTimeout(() => {
      const target = this.host.nativeElement.querySelector(`[data-component="${key}"]`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  }
}
