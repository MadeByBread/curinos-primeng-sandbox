import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'default' | 'small';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label: string;
  @Input() icon: string;
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'default';
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() routerLink: string | any[];

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClass(): string {
    const classes: string[] = [];

    if (this.variant === 'secondary') {
      classes.push('ui-button-secondary');
    }

    if (this.variant === 'ghost') {
      classes.push('ui-button-ghost');
    }

    if (this.size === 'small') {
      classes.push('ui-button-sm');
    }

    if (this.fullWidth) {
      classes.push('ui-button-full-width');
    }

    return classes.join(' ');
  }

  onClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }
}
