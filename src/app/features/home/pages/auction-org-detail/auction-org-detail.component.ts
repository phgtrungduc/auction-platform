import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { AssetService } from '../../../../core/services/asset.service';
import { AdvancedSearchRequest, NoticeSearchDocument } from '../../../../core/models/asset.model';
import { AssetStore } from '../../../../store/asset/asset.store';
import { AuctionOrgDetailResponse } from '../../../../core/services/asset.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

type AuctionOrgNavState = {
  auctionOrgName?: string;
  auctionLocation?: string;
  contactPhone?: string;
  contactEmail?: string;
  auctionSessionCount?: number;
};

@Component({
  selector: 'app-auction-org-detail',
  standalone: true,
  imports: [CommonModule, PaginationComponent, TooltipModule],
  templateUrl: './auction-org-detail.component.html',
  styleUrls: ['./auction-org-detail.component.scss']
})
export class AuctionOrgDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private assetService = inject(AssetService);
  private destroyRef = inject(DestroyRef);
  private assetStore = inject(AssetStore);

  // Header info (from navigation state)
  orgName = 'Đơn vị đấu giá';
  orgAddress = 'Đang cập nhật';
  contactPhone = 'Đang cập nhật';
  contactEmail = 'Đang cập nhật';
  fax = 'Đang cập nhật';
  websiteUrl = 'Đang cập nhật';
  legalRepresentative = 'Đang cập nhật';
  practicingCertificateNumber = 'Đang cập nhật';

  // Fake stats (reasonable random)
  totalAuctions = 0;
  totalAuctioneers = this.randomInt(3, 50);
  successRatePct = 0;
  totalAssets = this.randomInt(1, 25);
  successfulAuctions = 0;
  orgDetailLoading = false;

  // Listing "phiên đấu giá" (reuse notice cards)
  isListingLoading = false;
  notices: NoticeSearchDocument[] = [];
  currentPage = 1;
  totalPages = 1;
  readonly pageSize = 12;

  // Similar orgs (from store)
  similarOrgs$ = this.assetStore.auctionOrgs$;
  similarOrgsLoading$ = this.assetStore.auctionOrgsLoading$;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pm) => {
        const idStr = pm.get('id');
        const idNum = idStr != null ? Number(idStr) : null;

        if (idStr && Number.isFinite(idNum) && (idNum as number) > 0) {
          this.loadOrgById(idNum as number);
          return;
        }

        // fallback: keep existing flow from product-detail (router state)
        this.hydrateFromNavState();
        this.currentPage = 1;
        this.fetchOrgAuctions();
      });

    this.assetStore.getAuctionOrgs$({ limit: 4, offset: this.randomInt(1, 5)});
  }

  goBack(): void {
    window.history.back();
  }

  trackByNoticeId(_: number, it: NoticeSearchDocument): number {
    return it.noticeId;
  }

  // --- Listing helpers (copied from products listing behavior) ---
  private readonly defaultNoticeImage = 'assets/images/product-sample-1.jpg';
  private readonly categoryImageByRefId: Record<string, string> = {
    REAL_ESTATE: 'assets/images/bds.png',
    VEHICLE: 'assets/images/xeco.png',
    MACHINERY: 'assets/images/maymoc.png',
    GOODS: 'assets/images/hanghoa.png',
    HOUSEHOLD: 'assets/images/dodung.png',
    OTHER: 'assets/images/khac.png',
  };

  getNoticeImage(item: NoticeSearchDocument): string {
    const normalizedRefId = item.firstAssetCategoryRefId?.trim().toUpperCase();
    if (!normalizedRefId) return this.defaultNoticeImage;
    return this.categoryImageByRefId[normalizedRefId] ?? this.defaultNoticeImage;
  }

  getNoticeStatusLabel(status: string | undefined): string {
    if (!status) return 'Chưa rõ';
    switch (status) {
      case 'UPCOMING': return 'Mở đăng ký';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELLED': return 'Huỷ đấu giá';
      default: return status;
    }
  }

  getStatusClassByCode(status: string | undefined): string {
    switch (status) {
      case 'UPCOMING': return 'badge--green';
      case 'ONGOING': return 'badge--blue';
      case 'COMPLETED': return 'badge--gray';
      case 'CANCELLED': return 'badge--gray';
      default: return '';
    }
  }

  formatNoticeTitle(title: string | undefined | null): string {
    const t = title?.trim() ?? '';
    if (!t) return '—';
    const prefix = 'Thông báo việc đấu giá đối với danh mục tài sản:';
    if (t.startsWith(prefix)) {
      const rest = t.slice(prefix.length).trim();
      return rest || '—';
    }
    return t;
  }

  formatNoticePriceLine(item: NoticeSearchDocument): string {
    const min = item.minStartingPrice;
    const max = item.maxStartingPrice;
    const minOk = min != null && Number.isFinite(min);
    const maxOk = max != null && Number.isFinite(max);

    if (min != null && min < 100_000_000) {
      const minS = minOk ? (min as number / 1_000_000).toFixed(2) : null;
      const maxS = maxOk ? (max as number / 1_000_000).toFixed(2) : null;
      if (minS && maxS && min !== max) return `${minS} - ${maxS} triệu`;
      if (minS) return `${minS} triệu`;
      if (maxS) return `${maxS} triệu`;
    } else {
      const minS = minOk ? (min as number / 1_000_000_000).toFixed(2) : null;
      const maxS = maxOk ? (max as number / 1_000_000_000).toFixed(2) : null;
      if (minS && maxS && min !== max) return `${minS} - ${maxS} tỷ`;
      if (minS) return `${minS} tỷ`;
      if (maxS) return `${maxS} tỷ`;
    }

    return 'Không xác định';
  }

  navToDetail(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }

  navToOrgDetail(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/auction-org-detail', id]);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchOrgAuctions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  orgAuctionSessionCountFor(id: number): number {
    // stable "random" per org card, 100-1000 like requirement
    const n = Math.abs((id ?? 0) * 2654435761) % 901;
    return 100 + n;
  }

  // --- Internal ---
  private hydrateFromNavState(): void {
    const state = (history.state ?? {}) as AuctionOrgNavState;
    this.orgName = state.auctionOrgName?.trim() || 'Đơn vị đấu giá';
    this.orgAddress = state.auctionLocation?.trim() || 'Đang cập nhật';
    this.contactPhone = state.contactPhone?.trim() || 'Đang cập nhật';
    this.contactEmail = state.contactEmail?.trim() || 'Đang cập nhật';

    const passed = state.auctionSessionCount;
    if (typeof passed === 'number' && Number.isFinite(passed) && passed > 0) {
      this.totalAuctions = passed;
    }

    // Fake extra fields with phone/email as base when possible
    this.fax = this.contactPhone && this.contactPhone !== 'Đang cập nhật' ? this.contactPhone : 'Đang cập nhật';
    this.websiteUrl = 'Đang cập nhật';
    this.legalRepresentative = this.contactPhone && this.contactPhone !== 'Đang cập nhật' ? this.contactPhone : 'Đang cập nhật';
    this.practicingCertificateNumber = this.contactPhone && this.contactPhone !== 'Đang cập nhật' ? this.contactPhone : 'Đang cập nhật';

    // derive successful count from rate and total auctions
    //this.successfulAuctions = Math.max(0, Math.round((this.totalAuctions * this.successRatePct) / 100));
  }

  private loadOrgById(id: number): void {
    this.orgDetailLoading = true;
    this.assetService.getAuctionOrgDetail(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: AuctionOrgDetailResponse) => {
          this.applyOrgDetail(res);
          this.orgDetailLoading = false;

          this.currentPage = 1;
          this.fetchOrgAuctions();
        },
        error: () => {
          // if API fails, keep whatever is currently shown (or fallback to state)
          this.orgDetailLoading = false;
          if (!this.orgName || this.orgName === 'Đơn vị đấu giá') {
            this.hydrateFromNavState();
            this.currentPage = 1;
            this.fetchOrgAuctions();
          }
        }
      });
  }

  private applyOrgDetail(res: AuctionOrgDetailResponse): void {
    this.orgName = res.fullName?.trim() || 'Đơn vị đấu giá';
    this.orgAddress = (res.address ?? '').trim() || 'Đang cập nhật';
    this.contactPhone = (res.phone ?? '').trim() || 'Đang cập nhật';
    this.contactEmail = (res.email ?? '').trim() || 'Đang cập nhật';
    this.fax = (res.fax ?? '').trim() || 'Đang cập nhật';
    this.websiteUrl = (res.websiteUrl ?? '').trim() || 'Đang cập nhật';
    this.legalRepresentative = (res.legalRepresentative ?? '').trim() || 'Đang cập nhật';
    this.practicingCertificateNumber = (res.practicingCertificateNumber ?? '').trim() || 'Đang cập nhật';

    if (typeof res.totalAuctioneers === 'number' && Number.isFinite(res.totalAuctioneers)) {
      this.totalAuctioneers = res.totalAuctioneers;
    }
  }

  private fetchOrgAuctions(): void {
    if (!this.orgName?.trim()) {
      this.notices = [];
      this.totalPages = 1;
      return;
    }

    const req: AdvancedSearchRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      query: this.orgName,
      sortBy: 'newest',
    };

    this.isListingLoading = true;
    this.assetService.advancedSearch(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.notices = res.items ?? [];
          this.totalPages = res.totalPages ?? 1;
          this.isListingLoading = false;
          this.totalAuctions = res.totalCount;
          this.successfulAuctions = res.totalCount > 0 ? this.randomInt(res.totalCount / 2, res.totalCount) : 0;
          this.successRatePct = res.totalCount > 0 && this.successfulAuctions > 0 ? Math.floor(this.successfulAuctions/res.totalCount*100) : 0; 
        },
        error: () => {
          this.notices = [];
          this.totalPages = 1;
          this.isListingLoading = false;
        }
      });
  }

  private randomInt(min: number, max: number): number {
    const a = Math.ceil(min);
    const b = Math.floor(max);
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }
}

