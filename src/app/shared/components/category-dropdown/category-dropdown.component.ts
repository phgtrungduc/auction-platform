import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CategoryItem {
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
  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string | null>();
  @Input() categories: CategoryItem[] = [];
  @Input() placeholder: string = 'Loại tài sản';
  @Input() iconClass: string | null = null;

  isCategoryMenuOpen = false;

  toggleCategory(item: CategoryItem, event: Event) {
    event.stopPropagation();
    item.expanded = !item.expanded;
  }

  selectCategory(category: CategoryItem) {
    this.value = category.label;
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
