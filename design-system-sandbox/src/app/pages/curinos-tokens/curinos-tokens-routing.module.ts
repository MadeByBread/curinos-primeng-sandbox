import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CurinosTokensComponent } from './curinos-tokens.component';

const routes: Routes = [
  { path: '', component: CurinosTokensComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CurinosTokensRoutingModule { }
