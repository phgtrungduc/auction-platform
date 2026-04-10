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

  categories: CategoryItem[] = [];

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
