import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';

import { ComponentListRoutingModule } from './component-list-routing.module';
import { ComponentListComponent } from './component-list.component';

@NgModule({
  declarations: [ComponentListComponent],
  imports: [
    CommonModule,
    RouterModule,
    ComponentListRoutingModule,
    CardModule
  ]
})
export class ComponentListModule { }
