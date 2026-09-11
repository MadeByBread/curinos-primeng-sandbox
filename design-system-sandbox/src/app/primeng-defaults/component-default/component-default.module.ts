import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ComponentDemoModule } from '../../pages/components/component-demo/component-demo.module';
import { ComponentDefaultComponent } from './component-default.component';

const routes: Routes = [{ path: '', component: ComponentDefaultComponent }];

/**
 * Lazy on its own so the ~28 PrimeNG modules the demos need stay out of the
 * eager bundle. Only the catalogue's iframes ever load this route.
 */
@NgModule({
  declarations: [ComponentDefaultComponent],
  imports: [CommonModule, ComponentDemoModule, RouterModule.forChild(routes)]
})
export class ComponentDefaultModule { }
