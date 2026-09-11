import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ChipSeverity = 'neutral' | 'primary' | 'success' | 'info' | 'warning' | 'danger';

/**
 * Display token for Chip and Tag. PrimeNG 7's `p-chips` is a different
 * component — the input that holds these tokens — and is styled separately.
 *
 * A chip is removable, a tag is not. Same surface, different affordance.
 */
@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss']
})
export class ChipComponent {
  @Input() label: string;
  @Input() icon: string;
  @Input() severity: ChipSeverity = 'neutral';
  @Input() removable = false;

  @Output() removed = new EventEmitter<void>();

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.removed.emit();
  }
}
