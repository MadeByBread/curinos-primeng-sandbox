import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CurinosLogoComponent } from './curinos-logo/curinos-logo.component';
import { PhIconComponent } from './ph-icon/ph-icon.component';
import { ButtonComponent } from './button/button.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ChipComponent } from './chip/chip.component';
import { BadgeComponent } from './badge/badge.component';
import { StepperComponent } from './stepper/stepper.component';

const COMPONENTS = [
  CurinosLogoComponent,
  PhIconComponent,
  ButtonComponent,
  AvatarComponent,
  ChipComponent,
  BadgeComponent,
  StepperComponent
];

@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule, HttpClientModule, RouterModule, ButtonModule],
  exports: COMPONENTS
})
export class SharedModule { }
