import { DOCUMENT } from "@angular/common";
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { MenuItem, SelectItem } from "primeng/api";

import { ph, phDuotone } from "../../shared/icons/phosphor-icons";

/** Placeholder submenu link — use unique routerLink per item in real apps. */
const subMenuItem = (label: string): MenuItem => ({ label, url: "#" });

@Component({
  selector: "app-primeng-dashboard",
  templateUrl: "./primeng-dashboard.component.html",
  styleUrls: ["./primeng-dashboard.component.scss"],
})
export class PrimengDashboardComponent implements OnInit, OnDestroy {
  products: SelectItem[] = [
    { label: "Product A", value: "a" },
    { label: "Product B", value: "b" },
    { label: "Product C", value: "c" },
  ];

  selectedProduct: string;

  statCards = ["Header 4", "Header 4", "Header 4", "Header 4"];

  menuItems: MenuItem[] = [
    {
      label: "Overview",
      icon: phDuotone("parallelogram"),
      routerLink: ["/dashboard-default"],
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
        { label: "Settings", routerLink: ["/login-default"] },
      ],
    },
  ];

  accountMenuItems: MenuItem[] = [
    {
      label: "Switch to Curinos",
      icon: ph("swap"),
      command: () => this.router.navigate(["/dashboard"]),
    },
    { separator: true },
    {
      label: "Sign out",
      icon: ph("sign-out"),
      command: () => this.signOut(),
    },
  ];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit() {
    this.renderer.addClass(this.document.body, "primeng-default");
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, "primeng-default");
  }

  signOut() {
    this.router.navigate(["/login-default"]);
  }
}
