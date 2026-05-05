import { AsyncPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BaseComponent } from '../../../core/base/base.component';
import { Router } from '@angular/router';
import { AuthPopupComponent } from '../../../features/auth/pages/auth-popup/auth-popup.component';
import { selectIsLoggedIn, getUsername } from '../../../store/app-state';
import { AuthService } from '../../../features/auth/services/auth.service';
import { combineLatest, distinctUntilChanged, map, of, switchMap, catchError } from 'rxjs';

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
  imports: [AuthPopupComponent, AsyncPipe, SlicePipe, UpperCasePipe],
})
export class HeaderComponent extends BaseComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isMenuOpen = false;
  username$ = this.store.select(getUsername);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  /** Placeholder until credit API exists */
  creditBalance = 0;

  readonly headerUserVm$ = combineLatest([this.isLoggedIn$, this.username$]).pipe(
    distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1]),
    switchMap(([logged, storedUsername]) => {
      if (!logged) {
        return of({ type: 'guest' as const });
      }
      return this.authService.getCurrentUser().pipe(
        map((p) => ({
          type: 'user' as const,
          email: p.email || storedUsername,
          displayName: p.displayName || storedUsername.split('@')[0] || storedUsername || p.email,
        })),
        catchError(() =>
          of({
            type: 'user' as const,
            email: storedUsername,
            displayName: storedUsername.split('@')[0] || storedUsername,
          }),
        ),
      );
    }),
  );

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
  redirectToFavourites(){
    this.router.navigate(['/favourites-notices']);
  }

  redirectToProfile(): void {
    this.router.navigate(['/user-profile']);
  }
}
