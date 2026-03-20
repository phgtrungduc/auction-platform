import { Component, inject } from '@angular/core';
import { BaseComponent } from '../../../core/base/base.component';
import { Router } from '@angular/router';

export interface CategoryItem {
  label: string;
  value?: string;
  children?: CategoryItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent extends BaseComponent {
  private router = inject(Router);

  isMenuOpen = false;

  categories: CategoryItem[] = [
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

  constructor() {
    super();
  }

  toggle(item: CategoryItem, event: Event) {
    event.stopPropagation();
    item.expanded = !item.expanded;
  }

  selectCategory(category: CategoryItem) {
    this.router.navigate(['/products-listing'], { queryParams: { category: category.label } });
    this.isMenuOpen = false;
  }
}
