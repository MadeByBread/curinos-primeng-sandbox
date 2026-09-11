import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { SharedModule } from '../../shared/shared.module';
import { OverviewRoutingModule } from './overview-routing.module';
import { OverviewComponent } from './overview.component';

@NgModule({
  declarations: [OverviewComponent],
  imports: [
    CommonModule,
    RouterModule,
    OverviewRoutingModule,
    CardModule,
    ButtonModule,
    SharedModule
  ]
})
export class OverviewModule { }
