import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ComponentsComponent } from './components.component';

// One route per catalogue group so each gets its own nav item and URL.
const routes: Routes = [
  { path: '', redirectTo: 'customized-primeng', pathMatch: 'full' },
  { path: ':group', component: ComponentsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentsRoutingModule { }
