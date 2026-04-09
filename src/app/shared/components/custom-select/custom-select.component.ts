import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss'
})
export class CustomSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Chọn';
  @Input() value: any;
  @Input() icon: string | null = null;
  /** Truyền true để hiện ô tìm kiếm bên trong dropdown */
  @Input() searchable: boolean = false;
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;
  selectedLabel: string = '';
  searchQuery: string = '';

  /** Danh sách options đã lọc theo searchQuery */
  get filteredOptions(): SelectOption[] {
    if (!this.searchable || !this.searchQuery.trim()) {
      return this.options;
    }
    const q = this.searchQuery.toLowerCase();
    return this.options.filter(o => o.label.toLowerCase().includes(q));
  }

  ngOnInit() {
    this.setSelectedLabel();
  }

  ngOnChanges() {
    if (this.disabled) {
      this.isOpen = false;
      this.searchQuery = '';
    }
    this.setSelectedLabel();
  }

  toggleDropdown() {
    if (this.disabled) {
      return;
    }
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.searchQuery = '';   // reset khi đóng
    }
  }

  selectOption(option: SelectOption) {
    this.value = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.searchQuery = '';     // reset sau khi chọn
    this.valueChange.emit(this.value);
  }

  setSelectedLabel() {
    const found = this.options.find(o => o.value === this.value);
    this.selectedLabel = found ? found.label : '';
  }

  // click outside để đóng popup
  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (!event.target.closest('.custom-select')) {
      this.isOpen = false;
      this.searchQuery = '';
    }
  }

  clearValue(event: Event) {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.value = null;
    this.selectedLabel = '';
    this.searchQuery = '';
    this.valueChange.emit(this.value);
  }
}
