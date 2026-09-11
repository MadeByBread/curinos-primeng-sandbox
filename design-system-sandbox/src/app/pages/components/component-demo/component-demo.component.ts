import { Component, Input, OnDestroy } from '@angular/core';
import { MenuItem, MessageService, SelectItem, TreeNode } from 'primeng/api';
import { TerminalService } from 'primeng/components/terminal/terminalservice';
import { Subscription } from 'rxjs';

import { ph, phDuotone } from '../../../shared/icons/phosphor-icons';
import { StepperStep } from '../../../shared/stepper/stepper.component';

// 1×1 GIFs. Galleria stretches them to the panel, so they read as colour
// blocks without needing image assets or a sanitizer-blocked SVG data URI.
const SWATCH_BLUE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
const SWATCH_GREY = 'data:image/gif;base64,R0lGODlhAQABAIAAAPz8/AAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
const SWATCH_INK = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';

/**
 * One demo per catalogue entry, keyed by component key.
 *
 * Rendered twice with identical markup: inside the catalogue where Curinos
 * overrides apply, and inside the `/components-default` iframe where the
 * `primeng-default` body class suppresses them. Sharing the template is what
 * makes the side-by-side comparison trustworthy — any difference is styling,
 * never markup.
 */
@Component({
  selector: 'app-component-demo',
  templateUrl: './component-demo.component.html',
  styleUrls: ['./component-demo.component.scss']
})
export class ComponentDemoComponent implements OnDestroy {
  @Input() key = '';

  products: SelectItem[] = [
    { label: 'Personal Checking', value: 'checking' },
    { label: 'Business Savings', value: 'savings' },
    { label: 'Money Market', value: 'mmda' }
  ];

  selectedProduct: string;
  selectedProducts: string[] = [];
  textValue = '';
  areaValue = '';
  checked = true;
  radioValue = 'a';

  tableRows = [
    { product: 'Personal Checking', balance: '$12,450.00', growth: '+2.4%', status: 'Active' },
    { product: 'Business Savings', balance: '$84,120.00', growth: '+1.1%', status: 'Active' },
    { product: 'CD 12-Month', balance: '$25,000.00', growth: '+0.3%', status: 'Matured' },
    { product: 'Money Market', balance: '$6,780.00', growth: '-0.2%', status: 'Active' }
  ];

  treeNodes: TreeNode[] = [
    {
      label: 'Deposits',
      expanded: true,
      children: [
        { label: 'Personal Checking' },
        { label: 'Business Savings' }
      ]
    },
    {
      label: 'Time Deposits',
      children: [{ label: 'CD 12-Month' }]
    }
  ];

  treeTableNodes: TreeNode[] = [
    {
      data: { product: 'Deposits', balance: '$96,570.00', growth: '+1.8%' },
      expanded: true,
      children: [
        { data: { product: 'Personal Checking', balance: '$12,450.00', growth: '+2.4%' } },
        { data: { product: 'Business Savings', balance: '$84,120.00', growth: '+1.1%' } }
      ]
    },
    {
      data: { product: 'Time Deposits', balance: '$25,000.00', growth: '+0.3%' },
      children: [{ data: { product: 'CD 12-Month', balance: '$25,000.00', growth: '+0.3%' } }]
    }
  ];

  breadcrumbItems: MenuItem[] = [
    { label: 'Deposits' },
    { label: 'Personal' },
    { label: 'Checking' }
  ];

  breadcrumbHome: MenuItem = { icon: ph('house') };

  menuItems: MenuItem[] = [
    { label: 'View details', icon: ph('arrow-right') },
    { label: 'Duplicate', icon: ph('copy') },
    { separator: true },
    { label: 'Archive', icon: ph('archive') }
  ];

  menubarItems: MenuItem[] = [
    { label: 'Deposits', icon: phDuotone('bank'), items: [{ label: 'Summary' }, { label: 'Pricing' }] },
    { label: 'Reporting', icon: phDuotone('chart-pie'), items: [{ label: 'Balances' }] }
  ];

  panelMenuItems: MenuItem[] = [
    {
      label: 'Overview',
      icon: phDuotone('parallelogram'),
      expanded: true,
      items: [{ label: 'Summary', url: '#' }, { label: 'Opportunities', url: '#' }]
    },
    {
      label: 'Reporting',
      icon: phDuotone('chart-pie'),
      items: [{ label: 'Balances', url: '#' }]
    }
  ];

  accountMenuItems: MenuItem[] = [
    { label: 'Preferences', icon: ph('gear') },
    { separator: true },
    { label: 'Sign out', icon: ph('sign-out') }
  ];

  steps: StepperStep[] = [
    { label: 'Select market', hint: 'Done' },
    { label: 'Set pricing' },
    { label: 'Review' }
  ];

  activeStep = 1;

  dialogVisible = false;
  drawerVisible = false;

  phHouse = ph('house');
  phCheck = ph('check');
  phUser = ph('user-circle');
  phTrash = ph('trash');
  phX = ph('x');
  phSparkle = phDuotone('sparkle');

  productNames: string[] = [
    'Personal Checking',
    'Business Savings',
    'Money Market',
    'CD 12-Month'
  ];

  filteredProducts: string[] = [];
  autoCompleteValue: string;
  chipValues: string[] = ['Personal Checking', 'CD 12-Month'];
  colorValue = '#facc15';
  blocked = false;
  inplaceRate = '4.10%';
  orderItems: string[] = [
    'Personal Checking',
    'Business Savings',
    'Money Market',
    'CD 12-Month'
  ];
  pickSource: string[] = ['Personal Checking', 'Business Savings', 'Money Market'];
  pickTarget: string[] = ['CD 12-Month'];
  orgNodes: TreeNode[] = [
    {
      label: 'Deposits',
      expanded: true,
      children: [
        { label: 'Retail' },
        { label: 'Commercial' }
      ]
    }
  ];
  ratingValue = 3;
  sliderValue = 40;
  toggled = true;
  listStyle = { height: '160px' };
  scrollStyle = { width: '100%', height: '120px' };
  virtualStyle = { width: '100%', height: '148px' };
  galleryImages = [
    { source: SWATCH_BLUE, alt: 'Checking', title: 'Personal Checking' },
    { source: SWATCH_GREY, alt: 'Savings', title: 'Business Savings' },
    { source: SWATCH_INK, alt: 'CD', title: 'CD 12-Month' }
  ];

  private terminalSub: Subscription;

  constructor(private messages: MessageService, private terminal: TerminalService) {
    this.terminalSub = this.terminal.commandHandler.subscribe((command) => {
      this.terminal.sendResponse(
        command === 'balances' ? 'Personal Checking  $12,450.00' : 'Try: balances'
      );
    });
  }

  ngOnDestroy(): void {
    this.terminalSub.unsubscribe();
  }

  filterProducts(event: { query: string }): void {
    const query = (event.query || '').toLowerCase();
    this.filteredProducts = this.productNames.filter((name) => {
      return name.toLowerCase().indexOf(query) !== -1;
    });
  }

  showToast(severity: string): void {
    this.messages.add({
      key: 'catalogue',
      severity,
      summary: 'Pricing updated',
      detail: 'Personal Checking rate changed to 4.10%.'
    });
  }
}
