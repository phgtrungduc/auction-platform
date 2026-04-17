import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BaseComponent } from '../../../core/base/base.component';
import { Router } from '@angular/router';
import { AuthPopupComponent } from '../../../features/auth/pages/auth-popup/auth-popup.component';
import { getUsername } from '../../../store/app-state';
import { AuthService } from '../../../features/auth/services/auth.service';

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
  imports: [AuthPopupComponent, AsyncPipe],
})
export class HeaderComponent extends BaseComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isMenuOpen = false;
  username$ = this.store.select(getUsername);

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

  logout(): void {
    this.authService.logout();
  }
}
