import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssetService } from '../../../../core/services/asset.service';
import { AdvancedSearchRequest, NoticeSearchDocument } from '../../../../core/models/asset.model';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { CustomSelectComponent, SelectOption } from '@shared/components/custom-select/custom-select.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

type AssetOwnerNavState = {
  ownerName?: string;
  ownerAddress?: string;
};

@Component({
  selector: 'app-asset-owner-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, CustomSelectComponent, TooltipModule],
  templateUrl: './asset-owner-detail.component.html',
  styleUrls: ['./asset-owner-detail.component.scss']
})
export class AssetOwnerDetailComponent implements OnInit {
  private router = inject(Router);
  private assetService = inject(AssetService);
  private destroyRef = inject(DestroyRef);

  ownerName = 'Chủ tài sản';
  ownerAddress = 'Đang cập nhật';
  ownerPhone = 'Đang cập nhật';
  searchKeyword = '';

  notices: NoticeSearchDocument[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  readonly pageSize = 9;

  successfulAuctions = 0;
  successRatePct = 0;

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: null },
    { label: 'Mở đăng ký', value: 'UPCOMING' },
    { label: 'Đang diễn ra', value: 'ONGOING' },
    { label: 'Đã kết thúc', value: 'COMPLETED' }
  ];
  readonly sortOptions: SelectOption[] = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá tăng dần', value: 'price_asc' },
    { label: 'Giá giảm dần', value: 'price_desc' }
  ];
  selectedStatus: string | null = null;
  selectedSort: string | null = 'newest';

  private readonly defaultNoticeImage = 'assets/images/product-sample-1.jpg';
  private readonly categoryImageByRefId: Record<string, string> = {
    REAL_ESTATE: 'assets/images/bds.png',
    VEHICLE: 'assets/images/xeco.png',
    MACHINERY: 'assets/images/maymoc.png',
    GOODS: 'assets/images/hanghoa.png',
    HOUSEHOLD: 'assets/images/dodung.png',
    OTHER: 'assets/images/khac.png',
  };

  ngOnInit(): void {
    const state = (history.state ?? {}) as AssetOwnerNavState;
    this.ownerName = state.ownerName?.trim() || 'Chủ tài sản';
    this.ownerAddress = state.ownerAddress?.trim() || 'Đang cập nhật';
    this.fetchOwnerAssets();
  }

  goBack(): void {
    window.history.back();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchOwnerAssets();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.fetchOwnerAssets();
  }

  onStatusChange(value: string | null): void {
    this.selectedStatus = value;
    this.currentPage = 1;
    this.fetchOwnerAssets();
  }

  onSortChange(value: string | null): void {
    this.selectedSort = value;
    this.currentPage = 1;
    this.fetchOwnerAssets();
  }

  navToDetail(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/product-detail', id]);
  }

  getNoticeImage(item: NoticeSearchDocument): string {
    const normalizedRefId = item.firstAssetCategoryRefId?.trim().toUpperCase();
    if (!normalizedRefId) return this.defaultNoticeImage;
    return this.categoryImageByRefId[normalizedRefId] ?? this.defaultNoticeImage;
  }

  getStatusClassByCode(status: string | undefined): string {
    switch (status) {
      case 'UPCOMING': return 'badge--green';
      case 'ONGOING': return 'badge--blue';
      case 'COMPLETED': return 'badge--gray';
      default: return 'badge--gray';
    }
  }

  getNoticeStatusLabel(status: string | undefined): string {
    if (!status) return 'Chưa rõ';
    switch (status) {
      case 'UPCOMING': return 'Mở đăng ký';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      default: return status;
    }
  }

  formatNoticePriceLine(item: NoticeSearchDocument): string {
    const min = item.minStartingPrice;
    const max = item.maxStartingPrice;
    const minOk = min != null && Number.isFinite(min);
    const maxOk = max != null && Number.isFinite(max);

    const toTy = (v: number) => (v / 1_000_000_000).toFixed(2);
    if (minOk && maxOk && min !== max) return `${toTy(min)} - ${toTy(max)} tỷ`;
    if (minOk) return `${toTy(min)} tỷ`;
    if (maxOk) return `${toTy(max)} tỷ`;
    return 'Không xác định';
  }

  getOwnerInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  private fetchOwnerAssets(): void {
    if (!this.ownerName.trim()) {
      this.notices = [];
      this.totalCount = 0;
      this.totalPages = 1;
      return;
    }

    // Theo yêu cầu tạm thời: query luôn bằng tên chủ tài sản.
    const req: AdvancedSearchRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      query: this.ownerName,
      sortBy: this.selectedSort ?? 'newest',
      statuses: this.selectedStatus ? [this.selectedStatus] : undefined
    };

    this.isLoading = true;
    this.assetService.advancedSearch(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.notices = res.items ?? [];
          this.totalCount = res.totalCount ?? 0;
          this.totalPages = res.totalPages ?? 1;
          this.successfulAuctions = this.totalCount > 0 ? Math.floor(this.totalCount * 0.2) : 0;
          this.successRatePct = this.totalCount > 0 ? Math.floor((this.successfulAuctions / this.totalCount) * 100) : 0;
          this.isLoading = false;
        },
        error: () => {
          this.notices = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.successfulAuctions = 0;
          this.successRatePct = 0;
          this.isLoading = false;
        }
      });
  }
}
