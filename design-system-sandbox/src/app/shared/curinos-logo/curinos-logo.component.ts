import { Component, HostBinding, Input } from '@angular/core';

export type CurinosLogoVariant = 'wordmark' | 'one' | 'one-alt' | 'mark' | 'one-mark';

@Component({
  selector: 'app-curinos-logo',
  templateUrl: './curinos-logo.component.html',
  styleUrls: ['./curinos-logo.component.scss']
})
export class CurinosLogoComponent {
  @Input() variant: CurinosLogoVariant = 'wordmark';
  @Input() ariaLabel = 'Curinos';

  @HostBinding('class.curinos-logo-host--wordmark')
  get isWordmark(): boolean {
    return this.variant === 'wordmark';
  }

  @HostBinding('class.curinos-logo-host--one')
  get isOne(): boolean {
    return this.variant === 'one';
  }

  @HostBinding('class.curinos-logo-host--one-alt')
  get isOneAlt(): boolean {
    return this.variant === 'one-alt';
  }

  @HostBinding('class.curinos-logo-host--mark')
  get isMark(): boolean {
    return this.variant === 'mark';
  }

  @HostBinding('class.curinos-logo-host--one-mark')
  get isOneMark(): boolean {
    return this.variant === 'one-mark';
  }
}
