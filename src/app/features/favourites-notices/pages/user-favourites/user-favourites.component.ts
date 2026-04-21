import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { UserFavoriteStore } from '../../../../store/user-favorite/user-favorite.store';
import { UserFavoriteItem } from '../../../../core/models/user-favorite.model';
import { AuthService } from '../../../auth/services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';

type NoticeStatusCode = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

@Component({
  selector: 'app-user-favourites',
  standalone: true,
  imports: [CommonModule, PaginationComponent, TooltipModule],
  templateUrl: './user-favourites.component.html',
  styleUrl: './user-favourites.component.scss'
})
export class UserFavouritesComponent implements OnInit {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private favoriteStore = inject(UserFavoriteStore);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);

  private readonly defaultNoticeImage = 'assets/images/product-sample-1.jpg';

  notices: UserFavoriteItem[] = [];
  isFilterLoading = false;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  readonly pageSize = 20;

  showNotificationBanner = false;
  isEnablingNotification = false;

  ngOnInit(): void {
    this.favoriteStore.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        this.isFilterLoading = loading;
      });

    this.favoriteStore.listData$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.notices = (items ?? []).map(item => ({
          ...item,
          viewCount: item.viewCount ? item.viewCount : this.randInt(100, 300),
          favoriteCount: item.favoriteCount ? item.favoriteCount : this.randInt(3, 50)
        }));
      });

    this.favoriteStore.meta$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((meta) => {
        this.totalCount = meta.totalElements;
        this.currentPage = meta.pageNumber;
        this.totalPages = Math.max(1, Math.ceil(meta.totalElements / meta.pageSize));
      });

    this.favoriteStore.lastMutation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((m) => {
        if (!m) return;
        this.applyFavoriteMutation(m.noticeId, m.isLiked, m.favoriteId);
      });

    this.fetchPage();
    this.fetchNotificationStatus();
  }

  private fetchNotificationStatus(): void {
    this.authService.getCurrentUser().subscribe({
      next: (profile) => {
        this.showNotificationBanner = !profile?.isNotificated;
      },
      error: () => {
        this.showNotificationBanner = false;
      },
    });
  }

  enableNotification(): void {
    if (this.isEnablingNotification) return;

    this.isEnablingNotification = true;
    this.authService
      .updateNotificationStatus({ statusReceiveNotification: true })
      .subscribe({
        next: (response) => {
          this.isEnablingNotification = false;
          if (response.success) {
            this.showNotificationBanner = false;
            this.logger.success(response.message || 'Đã bật thông báo.');
          } else {
            this.logger.error(response.message || 'Không thể bật thông báo.');
          }
        },
        error: () => {
          this.isEnablingNotification = false;
          this.logger.error('Không thể bật thông báo. Vui lòng thử lại.');
        },
      });
  }

  fetchPage(): void {
    this.favoriteStore.getListData$({
      limit: this.pageSize,
      offset: (this.currentPage - 1) * this.pageSize
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchPage();
  }

  navToDetail(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }

  formatNoticeTitle(title: string | undefined | null): string {
    const t = title?.trim() ?? '';
    return t || '—';
  }

  getNoticeImage(_item: UserFavoriteItem): string {
    return this.defaultNoticeImage;
  }

  formatNoticePriceLine(item: UserFavoriteItem): string {
    if (!item.auctionDatetime) {
      return 'Không xác định thời điểm đấu giá';
    }

    return `Thời điểm đấu giá: ${this.formatDateTime(item.auctionDatetime)}`;
  }

  getOwnerInitials(name: string | undefined): string {
    if (!name) {
      return '?';
    }
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
  }

  getNoticeStatusLabel(status: string | undefined): string {
    if (!status) {
      return 'Chưa rõ';
    }

    switch (status as NoticeStatusCode) {
      case 'UPCOMING': return 'Mở đăng ký';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELLED': return 'Huỷ đấu giá';
      default: return status;
    }
  }

  getStatusClassByCode(status: string | undefined): string {
    switch (status as NoticeStatusCode) {
      case 'UPCOMING': return 'badge--green';
      case 'ONGOING': return 'badge--blue';
      case 'COMPLETED': return 'badge--gray';
      case 'CANCELLED': return 'badge--gray';
      default: return '';
    }
  }

  private formatDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  toggleFavorite(item: UserFavoriteItem, event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();

    const noticeId = item.noticeId;
    if (!noticeId) return;

    // Optimistic UI: toggle ngay để mượt, không chờ API response
    // Lưu ý: item lấy từ store có thể bị freeze (read-only) → không mutate trực tiếp.
    const nextIsLiked = !item.isLiked;
    this.notices = (this.notices ?? []).map((x) =>
      x.noticeId === noticeId ? { ...x, isLiked: nextIsLiked } : x
    );

    if (!nextIsLiked) {
      this.favoriteStore.removeFavorite$({ noticeId, favoriteId: item.favoriteId });
      return;
    }
    this.favoriteStore.addFavorite$(noticeId);
  }

  private applyFavoriteMutation(noticeId: number, isLiked: boolean, favoriteId?: number): void {
    this.notices = (this.notices ?? []).map((x) =>
      x.noticeId === noticeId
        ? {
          ...x,
          isLiked,
          favoriteId: favoriteId ?? x.favoriteId
        }
        : x
    );
  }

  /** Khởi điểm: min — max; nếu min = max chỉ hiển thị một mức. */
  formatStartingPriceRange(
    min: number | null | undefined,
    max: number | null | undefined
  ): string {
    const minOk = min != null && Number.isFinite(min);
    const maxOk = max != null && Number.isFinite(max);
    if (!minOk && !maxOk) {
      return 'Không xác định';
    }
    if (minOk && maxOk && Number(min) === Number(max)) {
      return this.formatPrice(min);
    }
    if (minOk && maxOk) {
      return `${this.formatPrice(min)} - ${this.formatPrice(max)}`;
    }
    if (minOk) {
      return this.formatPrice(min);
    }
    return this.formatPrice(max);
  }

  formatPrice(price: number | null | undefined): string {
    if (price == null) return 'Không xác định';
    if (price < 100_000_000) {
      return (price / 1_000_000).toFixed(2) + ' triệu';
    }
    return (price / 1_000_000_000).toFixed(2) + ' tỷ';
  }

  /** Random integer trong [min, max] (inclusive). */
  randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** API chưa trả viewCount → fake 100–300 cho UI mock. */
  resolveViewCount(v: number | null | undefined): number {
    return v != null ? v : this.randInt(100, 300);
  }

  /** API chưa trả favoriteCount → fake 0–50 cho UI mock. */
  resolveFavoriteCount(v: number | null | undefined): number {
    return v != null ? v : this.randInt(0, 50);
  }
}
