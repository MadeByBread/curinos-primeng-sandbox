import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { PrimengLoginComponent } from './primeng-defaults/primeng-login/primeng-login.component';
import { PrimengDashboardComponent } from './primeng-defaults/primeng-dashboard/primeng-dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login-default', component: PrimengLoginComponent },
  { path: 'dashboard-default', component: PrimengDashboardComponent },
  { path: '', loadChildren: './layout/layout.module#LayoutModule' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
