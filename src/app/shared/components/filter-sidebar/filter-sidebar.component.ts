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
        { label: 'Đất ở' },
        { label: 'Đất nông nghiệp' },
        { label: 'Nhà phố' },
        { label: 'Căn hộ' },
        { label: 'Nhà xưởng' },
        { label: 'Shophouse' },
      ]
    },
    {
      label: 'Xe cộ',
      children: [
        { label: 'Ô tô' },
        { label: 'Xe tải' },
        { label: 'Xe máy' }
      ]
    },
    {
      label: 'Máy móc',
      children: [
        { label: 'Máy công trình' },
        { label: 'Máy nông nghiệp' },
        { label: 'Dây chuyền' },
      ]
    },
    {
      label: 'Hàng hóa',
      children: [
        { label: 'Gạch/vật liệu' },
        { label: 'Sắt thép' },
        { label: 'Hàng tồn kho' },
      ]
    },
    {
      label: 'Đồ dùng',
      children: [
        { label: 'Nội thất' },
        { label: 'Thiết bị' },
        { label: 'Công vụ' },
      ]
    }
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
