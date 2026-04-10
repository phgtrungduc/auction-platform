import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CategoryItem {
  value?: string;
  label: string;
  expanded?: boolean;
  children?: CategoryItem[];
}

@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-dropdown.component.html',
  styleUrl: './category-dropdown.component.scss'
})
export class CategoryDropdownComponent {
  @Input() value: number | null = null;
  @Output() valueChange = new EventEmitter<number | null>();
  @Input() categories: CategoryItem[] = [];
  @Input() placeholder: string = 'Loại tài sản';
  @Input() iconClass: string | null = null;
  lable: string | null = null;

  isCategoryMenuOpen = false;

  toggleCategory(item: CategoryItem, event: Event) {
    event.stopPropagation();
    item.expanded = !item.expanded;
  }

  selectCategory(category: CategoryItem) {
    this.value = category && category.value ? Number(category.value) : null;
    this.lable = category && category.label ? category.label : null;
    this.valueChange.emit(this.value);
    this.isCategoryMenuOpen = false;
  }

  clearCategory(event: Event) {
    event.stopPropagation();
    this.value = null;
    this.valueChange.emit(this.value);
    this.isCategoryMenuOpen = false;
  }
}
