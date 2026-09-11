import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface StepperStep {
  label: string;
  /** Optional caption under the label. */
  hint?: string;
}

/**
 * PrimeNG 7 ships `p-steps`, which is an indicator with no content panels, so
 * only half of Figma's Stepper exists in the framework. This supplies the
 * indicator with completed, active and upcoming states; the panel is the
 * caller's markup.
 */
@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
  @Input() steps: StepperStep[] = [];
  @Input() activeIndex = 0;
  /** When false, steps render as status only and cannot be clicked. */
  @Input() navigable = true;

  @Output() stepSelected = new EventEmitter<number>();

  stateOf(index: number): 'complete' | 'active' | 'upcoming' {
    if (index < this.activeIndex) {
      return 'complete';
    }
    return index === this.activeIndex ? 'active' : 'upcoming';
  }

  onSelect(index: number): void {
    if (this.navigable) {
      this.stepSelected.emit(index);
    }
  }
}
