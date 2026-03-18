import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent {

  assetTypes: FilterItem[] = [
    { label: 'Tất cả', value: 'all' },
    {
      label: 'Bất động sản',
      children: [
        { label: 'Nhà ở' },
        { label: 'Đất nền' },
        { label: 'Căn hộ' }
      ]
    },
    {
      label: 'Xe cộ',
      children: [
        { label: 'Ô tô' },
        { label: 'Xe máy' }
      ]
    },
    { label: 'Máy móc' }
  ];

  cities = ['Tất cả', 'Hà Nội', 'Hồ Chí Minh', 'Bắc Ninh'];

  selectedValue: string | null = null;
  selectedCity: string | null = null;

  isActive(item: any): boolean {
    return this.selectedValue === (item.value || item.label);
  }

  toggle(item: any, event: Event) {
    event.stopPropagation();
    item.expanded = !item.expanded;
  }

  onSelect(item: any, event: Event) {
    event.stopPropagation();

    if (!item.children) {
      this.selectedValue = item.value || item.label;
    } else {
      item.expanded = !item.expanded;
    }
  }

}

export interface FilterItem {
  label: string;
  value?: string;
  children?: FilterItem[];
  expanded?: boolean;
}
