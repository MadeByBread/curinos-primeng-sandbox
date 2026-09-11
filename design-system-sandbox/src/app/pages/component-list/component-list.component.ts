import { Component } from '@angular/core';

import { componentCatalogue } from '../components/component-catalogue.generated';

interface ComponentListEntry {
  key: string;
  name: string;
  status: string;
  groupId: string;
  groupTitle: string;
}

const STATUS_LABELS: { [key: string]: string } = {
  styled: 'Curinos styled',
  stock: 'Not yet styled',
  built: 'Built here',
  planned: 'Planned',
  gap: 'No design'
};

@Component({
  selector: 'app-component-list',
  templateUrl: './component-list.component.html',
  styleUrls: ['./component-list.component.scss']
})
export class ComponentListComponent {
  readonly components: ComponentListEntry[] = componentCatalogue
    .flatMap(group =>
      group.components.map(component => ({
        key: component.key,
        name: component.name,
        status: component.status,
        groupId: group.id,
        groupTitle: group.title
      }))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  statusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  }
}
