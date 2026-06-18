import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';

import { CurinosTokensRoutingModule } from './curinos-tokens-routing.module';
import { CurinosTokensComponent } from './curinos-tokens.component';

@NgModule({
  declarations: [CurinosTokensComponent],
  imports: [CommonModule, RouterModule, CurinosTokensRoutingModule, CardModule]
})
export class CurinosTokensModule { }
