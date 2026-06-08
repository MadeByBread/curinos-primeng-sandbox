import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  showDefaultLinkStyle = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  toggleForgotPasswordStyle(event: Event) {
    event.preventDefault();
    this.showDefaultLinkStyle = !this.showDefaultLinkStyle;
  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'auth-layout');
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'auth-layout');
  }
}
