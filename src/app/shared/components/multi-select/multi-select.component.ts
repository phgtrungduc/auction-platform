import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface MultiSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
})
export class MultiSelectComponent {
  @ViewChild('valueContainer') valueContainer?: ElementRef<HTMLElement>;

  @Input() options: MultiSelectOption[] = [];
  @Input() value: string[] = [];
  @Input() placeholder = 'Chọn';
  @Input() searchable = false;
  @Input() disabled = false;
  @Input() countNotePrefix = 'Đã chọn';
  @Input() countNoteSuffix = 'khu vực';
  @Output() valueChange = new EventEmitter<string[]>();

  isOpen = false;
  isOverflowing = false;
  searchQuery = '';

  get filteredOptions(): MultiSelectOption[] {
    if (!this.searchable || !this.searchQuery.trim()) {
      return this.options;
    }
    const q = this.searchQuery.toLowerCase();
    return this.options.filter(item => item.label.toLowerCase().includes(q));
  }

  ngAfterViewInit(): void {
    this.updateOverflowState();
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.searchQuery = '';
    }
    this.updateOverflowState();
  }

  toggleOption(optionValue: string): void {
    const next = this.value.includes(optionValue)
      ? this.value.filter(item => item !== optionValue)
      : [...this.value, optionValue];
    this.value = next;
    this.valueChange.emit(next);
    this.updateOverflowState();
  }

  removeOption(optionValue: string, event: MouseEvent): void {
    event.stopPropagation();
    const next = this.value.filter(item => item !== optionValue);
    this.value = next;
    this.valueChange.emit(next);
    this.updateOverflowState();
  }

  clearAll(event: MouseEvent): void {
    event.stopPropagation();
    this.value = [];
    this.valueChange.emit([]);
    this.updateOverflowState();
  }

  isSelected(optionValue: string): boolean {
    return this.value.includes(optionValue);
  }

  get selectedLabels(): string[] {
    const byValue = new Map(this.options.map(item => [item.value, item.label]));
    return this.value.map(item => byValue.get(item) ?? item);
  }

  get visibleSelectedItems(): { label: string; value: string }[] {
    const maxVisible = 2;
    return this.value.slice(0, maxVisible).map(itemValue => {
      const label = this.options.find(item => item.value === itemValue)?.label ?? itemValue;
      return { label, value: itemValue };
    });
  }

  get hiddenSelectedCount(): number {
    const maxVisible = 2;
    return Math.max(0, this.value.length - maxVisible);
  }

  get selectionCountText(): string {
    return `${this.countNotePrefix} ${this.value.length} ${this.countNoteSuffix}`;
  }

  private updateOverflowState(): void {
    queueMicrotask(() => {
      const el = this.valueContainer?.nativeElement;
      if (!el) return;
      this.isOverflowing = el.scrollWidth > el.clientWidth;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.multi-select')) {
      this.isOpen = false;
      this.searchQuery = '';
    }
  }
}
