import { Component, ViewEncapsulation } from '@angular/core';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {
  products: SelectItem[] = [
    { label: 'Product A', value: 'a' },
    { label: 'Product B', value: 'b' },
    { label: 'Product C', value: 'c' }
  ];

  selectedProduct: string;

  statCards = ['Header 4', 'Header 4', 'Header 4', 'Header 4'];
}
