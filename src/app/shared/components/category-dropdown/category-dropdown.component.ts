import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
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
export class CategoryDropdownComponent implements OnChanges {
  @Input() value: number | null = null;
  @Output() valueChange = new EventEmitter<number | null>();
  @Input() categories: CategoryItem[] = [];
  @Input() placeholder: string = 'Loại tài sản';
  @Input() iconClass: string | null = null;
  lable: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['categories']) {
      this.updateLabelFromValue();
    }
  }

  private updateLabelFromValue() {
    if (this.value === null || this.value === undefined) {
      this.lable = null;
      return;
    }

    let foundLabel: string | null = null;
    for (const cat of this.categories) {
      if (cat.value && Number(cat.value) === this.value) {
        foundLabel = cat.label;
        break;
      }
      if (cat.children) {
        const child = cat.children.find(c => c.value && Number(c.value) === this.value);
        if (child) {
          foundLabel = child.label;
          break;
        }
      }
    }
    this.lable = foundLabel;
  }

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
