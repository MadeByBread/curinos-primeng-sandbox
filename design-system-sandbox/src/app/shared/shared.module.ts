import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CurinosLogoComponent } from './curinos-logo/curinos-logo.component';
import { PhIconComponent } from './ph-icon/ph-icon.component';
import { ButtonComponent } from './button/button.component';

@NgModule({
  declarations: [CurinosLogoComponent, PhIconComponent, ButtonComponent],
  imports: [CommonModule, HttpClientModule, RouterModule, ButtonModule],
  exports: [CurinosLogoComponent, PhIconComponent, ButtonComponent]
})
export class SharedModule { }
