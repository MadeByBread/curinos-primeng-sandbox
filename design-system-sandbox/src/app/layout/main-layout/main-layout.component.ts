import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { componentCatalogueIndex } from '../../pages/components/component-catalogue-index.generated';
import { ph, phDuotone } from '../../shared/icons/phosphor-icons';

const COMPONENT_SECTION_ICONS: { [id: string]: string } = {
  'customized-primeng': phDuotone('squares-four'),
  'new-components': phDuotone('puzzle-piece'),
  'primeng7-gap': phDuotone('circle-dashed'),
};

/**
 * One submenu entry per catalogued component, generated from the same manifest
 * the catalogue page renders, so the two cannot drift.
 *
 * The target travels as `?c=` rather than a router fragment: PrimeNG 7's
 * MenuItem has no `fragment` field and PanelMenu only binds routerLink and
 * queryParams. It is the key the stock-preview iframe already addresses.
 */
const componentListSection = (): MenuItem => ({
  label: 'Component List',
  icon: phDuotone('list-bullets'),
  routerLink: ['/component-list'],
  expanded: false,
  items: componentCatalogueIndex
    .flatMap(group =>
      group.components.map(component => ({
        label: component.name,
        groupId: group.id,
        key: component.key
      }))
    )
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(component => ({
      label: component.label,
      routerLink: ['/components', component.groupId],
      queryParams: { c: component.key },
      routerLinkActiveOptions: { exact: true }
    }))
});

const componentSections = (): MenuItem[] =>
  componentCatalogueIndex.map((group) => ({
    label: group.title,
    icon: COMPONENT_SECTION_ICONS[group.id],
    routerLink: ['/components', group.id],
    // The two built sections are the working areas and stay open. The gap
    // section is a backlog and would bury them.
    expanded: group.id !== 'primeng7-gap',
    items: group.components.map((component) => ({
      label: component.name,
      routerLink: ['/components', group.id],
      queryParams: { c: component.key },
      // Siblings share a path, so inexact matching would light all of them.
      routerLinkActiveOptions: { exact: true },
    })),
  }));

const BASE_MENU_ITEMS: MenuItem[] = [
  {
    label: 'Overview',
    icon: phDuotone('book-open-text'),
    routerLink: ['/overview'],
  },
  {
    label: 'Curinos Tokens',
    icon: phDuotone('palette'),
    routerLink: ['/curinos-tokens'],
  },
  componentListSection(),
  ...componentSections(),
  {
    label: 'Layout',
    icon: phDuotone('layout'),
    routerLink: ['/dashboard'],
  },
];

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  showMenubar = false;
  sidebarCollapsed = false;
  menuItems: MenuItem[] = [];

  topBarItems: MenuItem[] = [
    { label: 'Dashboard', icon: phDuotone('chart-bar') },
  ];

  accountMenuItems: MenuItem[] = [
    {
      label: 'Switch to Default',
      icon: ph('swap'),
      command: () => this.router.navigate(['/dashboard-default']),
    },
    { separator: true },
    {
      label: 'Sign out',
      icon: ph('sign-out'),
      command: () => this.signOut(),
    },
  ];

  private routerSub: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.menuItems = this.buildMenuItems();
    this.updateMenubar();
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateMenubar());
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private buildMenuItems(): MenuItem[] {
    return BASE_MENU_ITEMS.map((item): MenuItem => {
      if (!item.items) {
        return { ...item };
      }

      const label = item.label as string;
      return {
        ...item,
        command: () => this.onSectionHeaderClick(label),
      };
    });
  }

  private onSectionHeaderClick(label: string): void {
    if (this.sidebarCollapsed) {
      this.expandSidebarForSection(label);
    }
  }

  private expandSidebarForSection(label: string): void {
    this.sidebarCollapsed = false;
    this.setSectionExpanded(label, true);
    setTimeout(() => this.setSectionExpanded(label, true), 0);
  }

  private setSectionExpanded(label: string, expanded: boolean): void {
    this.menuItems = this.menuItems.map((item) =>
      item.label === label && item.items ? { ...item, expanded } : { ...item },
    );
  }

  private updateMenubar() {
    const child = this.route.firstChild;
    this.showMenubar = !!(child && child.snapshot.data.showMenubar === true);
  }

  signOut() {
    this.router.navigate(['/login']);
  }
}
