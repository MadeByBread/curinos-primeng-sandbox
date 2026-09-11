import { Component, Input } from '@angular/core';

export type BadgeSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'contrast';

export type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Count or status overlay. PrimeNG did not ship a standalone Badge until later
 * versions. Figma inverts the semantic scale — tier 3 is the fill and tier 2
 * the label — unlike Chip and Tag.
 */
@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() value: string | number;
  @Input() severity: BadgeSeverity = 'primary';
  @Input() size: BadgeSize = 'md';
  /** Dot with no label when true, or when value is empty. */
  @Input() dot = false;
  /** Ring for badges sitting on another surface, e.g. an avatar. */
  @Input() bordered = false;

  get isDot(): boolean {
    return this.dot || this.value === undefined || this.value === null || this.value === '';
  }
}
