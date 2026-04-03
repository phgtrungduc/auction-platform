import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent {
  @Input() value: Date | null = null;
  @Output() valueChange = new EventEmitter<Date | null>();

  @ViewChild('container') container!: ElementRef;

  isOpen = false;

  currentDate = new Date();
  selectedDate: Date | null = null;

  days: any[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  ngOnInit() {
    if (this.value) {
      this.selectedDate = new Date(this.value);
      this.currentDate = new Date(this.value);
    }
    this.generateCalendar();
  }

  ngOnChanges() {
    if (this.value) {
      this.selectedDate = new Date(this.value);
      this.currentDate = new Date(this.value);
      this.generateCalendar();
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = (firstDay.getDay() + 6) % 7;

    const days: any[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push({ day: null });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        day: i,
        date: new Date(year, month, i)
      });
    }

    this.days = days;
  }

  selectDate(day: any) {
    if (!day.date) return;

    this.selectedDate = day.date;
    this.value = day.date;

    this.valueChange.emit(this.value);
    this.isOpen = false;
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
    this.generateCalendar();
  }

  isSelected(day: any) {
    if (!this.selectedDate || !day.date) return false;
    return this.selectedDate.toDateString() === day.date.toDateString();
  }

  clear(event: Event) {
    event.stopPropagation();
    this.value = null;
    this.selectedDate = null;
    this.valueChange.emit(null);
  }

  getMonthYear(): string {
    const m = this.currentDate.getMonth() + 1;
    const y = this.currentDate.getFullYear();
    return `Tháng ${m.toString().padStart(2, '0')} ${y}`;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!this.container?.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
