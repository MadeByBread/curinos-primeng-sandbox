import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

import { ph, phDuotone } from "../../shared/icons/phosphor-icons";

/** Placeholder submenu link — use unique routerLink per item in real apps. */
const subMenuItem = (label: string): MenuItem => ({ label, url: "#" });

const BASE_MENU_ITEMS: MenuItem[] = [
  {
    label: "Overview",
    icon: phDuotone("parallelogram"),
    routerLink: ["/dashboard"],
  },
  {
    label: "Transition",
    icon: phDuotone("arrows-left-right"),
    routerLink: ["/transition"],
  },
  {
    label: "Curinos Tokens",
    icon: phDuotone("palette"),
    routerLink: ["/curinos-tokens"],
  },
  {
    label: "New Customers",
    icon: phDuotone("perspective"),
    expanded: true,
    items: [
      subMenuItem("Summary"),
      subMenuItem("Opportunities"),
      subMenuItem("Campaign Builder"),
      subMenuItem("Campaign Manager"),
      subMenuItem("Campaign Reporting"),
    ],
  },
  {
    label: "Existing Customers",
    icon: phDuotone("webcam"),
    expanded: true,
    items: [
      subMenuItem("Summary"),
      subMenuItem("Opportunities"),
      subMenuItem("Program Builder"),
      subMenuItem("Program Manager"),
      subMenuItem("Program Reporting"),
    ],
  },
  {
    label: "Portfolio Pricing",
    icon: phDuotone("replit-logo"),
    expanded: false,
    items: [subMenuItem("Summary")],
  },
  {
    label: "Reporting",
    icon: phDuotone("chart-pie"),
    expanded: true,
    items: [subMenuItem("Summary"), subMenuItem("Budget & ROI")],
  },
  {
    label: "Data Management",
    icon: phDuotone("table"),
    expanded: true,
    items: [
      subMenuItem("Segments"),
      subMenuItem("File Management"),
      { label: "Settings", routerLink: ["/login"] },
    ],
  },
];

@Component({
  selector: "app-main-layout",
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  showMenubar = false;
  sidebarCollapsed = false;
  menuItems: MenuItem[] = [];

  topBarItems: MenuItem[] = [{ label: "Dashboard", icon: "pi pi-chart-bar" }];

  accountMenuItems: MenuItem[] = [
    {
      label: "Switch to Default",
      icon: ph("swap"),
      command: () => this.router.navigate(["/dashboard-default"]),
    },
    { separator: true },
    {
      label: "Sign out",
      icon: ph("sign-out"),
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
    this.router.navigate(["/login"]);
  }
}
