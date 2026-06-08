import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelMenuModule } from 'primeng/panelmenu';

import { TransitionRoutingModule } from './transition-routing.module';
import { TransitionComponent } from './transition.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [TransitionComponent],
  imports: [
    CommonModule,
    FormsModule,
    TransitionRoutingModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    PanelMenuModule,
    SharedModule
  ]
})
export class TransitionModule { }
