import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadChildren: '../pages/overview/overview.module#OverviewModule',
        data: { showMenubar: false }
      },
      {
        path: 'dashboard',
        loadChildren: '../pages/pages.module#PagesModule',
        data: { showMenubar: false }
      },
      {
        path: 'components',
        loadChildren: '../pages/components/components.module#ComponentsModule',
        data: { showMenubar: false }
      },
      // The Transition page became the component catalogue.
      { path: 'transition', redirectTo: 'components' },
      {
        path: 'curinos-tokens',
        loadChildren: '../pages/curinos-tokens/curinos-tokens.module#CurinosTokensModule',
        data: { showMenubar: false }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
