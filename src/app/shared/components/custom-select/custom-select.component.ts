import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss'
})
export class CustomSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Chọn';
  @Input() value: any;

  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;
  selectedLabel: string = '';

  ngOnInit() {
    this.setSelectedLabel();
  }

  ngOnChanges() {
    this.setSelectedLabel();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: SelectOption) {
    this.value = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;

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
    }
  }

  clearValue(event: Event) {
    event.stopPropagation();
    this.value = null;
    this.selectedLabel = '';
    this.valueChange.emit(this.value);
  }
}
