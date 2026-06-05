import { Component, HostBinding, Input } from '@angular/core';

export type CurinosLogoVariant = 'wordmark' | 'mark';

@Component({
  selector: 'app-curinos-logo',
  templateUrl: './curinos-logo.component.html',
  styleUrls: ['./curinos-logo.component.scss']
})
export class CurinosLogoComponent {
  private static nextId = 0;

  @Input() variant: CurinosLogoVariant = 'wordmark';
  @Input() ariaLabel = 'Curinos';

  readonly maskId = `curinos-mark-mask-${CurinosLogoComponent.nextId++}`;

  @HostBinding('class.curinos-logo-host--wordmark')
  get isWordmark(): boolean {
    return this.variant === 'wordmark';
  }

  @HostBinding('class.curinos-logo-host--mark')
  get isMark(): boolean {
    return this.variant === 'mark';
  }
}
