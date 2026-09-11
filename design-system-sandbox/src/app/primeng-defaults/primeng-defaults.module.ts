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
import { TableModule } from 'primeng/table';

import { SharedModule } from '../shared/shared.module';
import { PrimengLoginComponent } from './primeng-login/primeng-login.component';
import { PrimengDashboardComponent } from './primeng-dashboard/primeng-dashboard.component';

/**
 * Stock PrimeNG (nova-light) example screens. They render the same components
 * as the Curinos pages but without the design-system overrides — each page adds
 * `primeng-default` to <body>, which suppresses everything in _overrides.scss.
 *
 * The catalogue's per-component stock previews live in ComponentDefaultModule,
 * which is lazy.
 */
@NgModule({
  declarations: [PrimengLoginComponent, PrimengDashboardComponent],
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
    TableModule,
    SharedModule
  ],
  exports: [PrimengLoginComponent, PrimengDashboardComponent]
})
export class PrimengDefaultsModule { }
