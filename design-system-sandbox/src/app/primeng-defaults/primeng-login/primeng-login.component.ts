import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-primeng-login',
  templateUrl: './primeng-login.component.html',
  styleUrls: ['./primeng-login.component.scss']
})
export class PrimengLoginComponent implements OnInit, OnDestroy {
  showCurinosLinkStyle = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  toggleForgotPasswordStyle(event: Event) {
    event.preventDefault();
    this.showCurinosLinkStyle = !this.showCurinosLinkStyle;
  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'auth-layout');
    this.renderer.addClass(this.document.body, 'primeng-default');
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'auth-layout');
    this.renderer.removeClass(this.document.body, 'primeng-default');
  }
}
