import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';

import { SharedModule } from '../shared/shared.module';
import { PrimengLoginComponent } from './primeng-login/primeng-login.component';
import { PrimengDashboardComponent } from './primeng-dashboard/primeng-dashboard.component';
import { TransitionDefaultComponent } from './transition-default/transition-default.component';

/**
 * Stock PrimeNG (nova-light) versions of the login & dashboard pages.
 * They render the same components as the Curinos pages but without the
 * design-system overrides — the pages add `primeng-default` to <body>,
 * which suppresses the global Curinos overrides in _overrides.scss.
 */
@NgModule({
  declarations: [
    PrimengLoginComponent,
    PrimengDashboardComponent,
    TransitionDefaultComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    MenuModule,
    PanelMenuModule,
    SharedModule
  ],
  exports: [
    PrimengLoginComponent,
    PrimengDashboardComponent,
    TransitionDefaultComponent
  ]
})
export class PrimengDefaultsModule { }
