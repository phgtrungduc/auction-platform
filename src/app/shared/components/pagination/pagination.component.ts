import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges {
  @Input() page: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  pages: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page'] || changes['totalPages']) {
      this.calculatePages();
    }
  }

  ngOnInit() {
    this.calculatePages();
  }

  calculatePages() {
    this.pages = [];
    
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i);
      }
    } else {
      if (this.page <= 3) {
        this.pages = [1, 2, 3, '...', this.totalPages];
      } else if (this.page >= this.totalPages - 2) {
        this.pages = [1, '...', this.totalPages - 2, this.totalPages - 1, this.totalPages];
      } else {
        this.pages = [1, '...', this.page - 1, this.page, this.page + 1, '...', this.totalPages];
      }
    }
  }

  goToPage(p: number | string) {
    if (typeof p === 'number') {
      if (p !== this.page && p >= 1 && p <= this.totalPages) {
        this.page = p;
        this.pageChange.emit(this.page);
        this.calculatePages();
      }
    }
  }

  next() {
    if (this.page < this.totalPages) {
      this.goToPage(this.page + 1);
    }
  }

  prev() {
    if (this.page > 1) {
      this.goToPage(this.page - 1);
    }
  }
}
