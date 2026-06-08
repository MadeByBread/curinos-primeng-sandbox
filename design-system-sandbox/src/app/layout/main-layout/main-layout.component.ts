import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

import { ph, phDuotone } from "../../shared/icons/phosphor-icons";

/** Placeholder submenu link — use unique routerLink per item in real apps. */
const subMenuItem = (label: string): MenuItem => ({ label, url: "#" });

@Component({
  selector: "app-main-layout",
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  showMenubar = false;

  menuItems: MenuItem[] = [
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

  private updateMenubar() {
    const child = this.route.firstChild;
    this.showMenubar = !!(child && child.snapshot.data.showMenubar === true);
  }

  signOut() {
    this.router.navigate(["/login"]);
  }
}
