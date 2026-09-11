import { Component, Input } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarShape = 'circle' | 'square';

/**
 * PrimeNG did not ship an Avatar until v10, so there is nothing to restyle.
 * Sizes come from the Curinos controls/sizing scale so an avatar lines up with
 * the buttons and inputs beside it.
 */
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input() label: string;
  @Input() image: string;
  @Input() icon: string;
  @Input() size: AvatarSize = 'md';
  @Input() shape: AvatarShape = 'circle';

  get initials(): string {
    if (!this.label) {
      return '';
    }
    return this.label
      .split(/\s+/)
      .filter(part => part.length)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }
}
