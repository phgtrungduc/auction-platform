import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { UserFavoriteStore } from '../../store/user-favorite/user-favorite.store';
import { SuggestNotificatedPopupComponent } from '@shared/components/suggest-notificated-popup/suggest-notificated-popup.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, SuggestNotificatedPopupComponent],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly userFavoriteStore = inject(UserFavoriteStore);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(SuggestNotificatedPopupComponent)
  suggestPopup?: SuggestNotificatedPopupComponent;

  ngOnInit(): void {
    this.userFavoriteStore.lastMutation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mutation) => {
        if (mutation?.isLiked && mutation.isFirstTime) {
          this.suggestPopup?.open();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
