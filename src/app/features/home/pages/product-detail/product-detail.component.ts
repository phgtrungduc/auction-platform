import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetStore } from '../../../../store/asset/asset.store';
import { Subject, takeUntil } from 'rxjs';
import { AdvancedSearchRequest, MarketplaceNoticeDetail, NoticeSearchDocument } from '../../../../core/models/asset.model';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastService } from '@core/services/toast.service';
import { LoadingOverlayComponent } from '@shared/components/loading-overlay/loading-overlay.component';
import { UserFavoriteStore } from '../../../../store/user-favorite/user-favorite.store';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../../store/app-state';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, TooltipModule, LoadingOverlayComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public assetStore = inject(AssetStore);
  private userFavoriteStore = inject(UserFavoriteStore);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();
  private logger = inject(LoggerService);
  private store = inject(Store);

  product: MarketplaceNoticeDetail | null = null;
  expandedAssets: boolean[] = [];
  similarProducts: SimilarProductItem[] = [];
  isProductFavorited: boolean = false;
  productFavoriteId: number | undefined = undefined;
  countView = this.randomInt(100, 300);
  countFavourite = this.randomInt(0, 50);

  countdownDays: string = '0';
  countdownHours: string = '00';
  countdownMinutes: string = '00';
  countdownSeconds: string = '00';
  isDocSaleExpired: boolean = false;
  private timerInterval: any;
  private readonly fallbackAuctionSessionCount = this.randomInt(100, 1000);
  private readonly defaultNoticeImage = 'assets/images/product-sample-1.jpg';
  private readonly categoryImageByRefId: Record<string, string> = {
    REAL_ESTATE: 'assets/images/bds.png',
    VEHICLE: 'assets/images/xeco.png',
    MACHINERY: 'assets/images/maymoc.png',
    GOODS: 'assets/images/hanghoa.png',
    HOUSEHOLD: 'assets/images/dodung.png',

    RE_DAT_O: 'assets/images/dato.png',
    RE_DAT_NONG_NGHIEP: 'assets/images/datnongnghiep.png',
    RE_NHA_PHO: 'assets/images/nhapho.png',
    RE_CAN_HO: 'assets/images/canho.png',
    RE_NHA_XUONG: 'assets/images/nhaxuong.png',
    RE_SHOPHOUSE: 'assets/images/shopehouse.png',
    VEH_OTO: 'assets/images/oto.png',
    VEH_XE_TAI: 'assets/images/xeco.png',
    VEH_XE_MAY: 'assets/images/xemay.png',
    MAC_MAY_CONG_TRINH: 'assets/images/maycongtrinh.png',
    MAC_MAY_NONG_NGHIEP: 'assets/images/maynongnghiep.png',
    MAC_DAY_CHUYEN: 'assets/images/daychuyen.png',
    GOODS_GACH_VAT_LIEU: 'assets/images/gach.png',
    GOODS_SAT_THEP: 'assets/images/satthep.png',
    GOODS_HANG_TON_KHO: 'assets/images/hangtonkho.png',
    HH_NOI_THAT: 'assets/images/noithat.png',
    HH_THIET_BI: 'assets/images/thietbi.png',
    HH_CONG_CU: 'assets/images/congcu.png',

    // Backward-compatible aliases
    RE_BDS: 'assets/images/bds.png',
    VHE_OTO: 'assets/images/oto.png',
    VH_XE_MAY: 'assets/images/xemay.png',
    VH_XE_CO: 'assets/images/xeco.png',
    EQ_MAY_MOC: 'assets/images/maymoc.png',
    EQ_MAY_CONG_TRINH: 'assets/images/maycongtrinh.png',
    EQ_MAY_NONG_NGHIEP: 'assets/images/maynongnghiep.png',
    GOODS_HANG_HOA: 'assets/images/hanghoa.png',
    GOODS_DO_DUNG: 'assets/images/dodung.png',
    OTHER: 'assets/images/khac.png',
  };

  ngOnInit(): void {
    this.assetStore.detailData$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.product = data;
      if (this.product?.assets) {
        this.expandedAssets = this.product.assets.map((_: any, i: number) => i === 0);
      } else {
        this.expandedAssets = [];
      }

      this.isProductFavorited = !!this.product?.isFavorite;
      this.productFavoriteId = this.product?.favoriteId;

      if (this.product?.docSaleEnd) {
        this.startCountdown(this.product.docSaleEnd);
      }

      const req = this.buildSimilarSearchRequest(this.product);
      if (req) {
        this.assetStore.getSimilarListData$(req);
      }
    });

    this.assetStore.similarListData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.similarProducts = (items ?? []).map((x) => this.mapNoticeToSimilarProduct(x));
      });

    this.userFavoriteStore.lastMutation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((m) => {
        if (!m) return;
        this.applyFavoriteMutationToSimilar(m.noticeId, m.isLiked, m.favoriteId);
        this.applyFavoriteMutationToProduct(m.noticeId, m.isLiked, m.favoriteId);
      });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.assetStore.getDetail$(id);

        // Cuộn lên đầu trang mượt mà khi load item mới
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  get auctionSessionCount(): number {
    const v = (this.product as any)?.auctionSessionCount ?? (this.product as any)?.auctionSessionTotal;
    const num = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(num) && num > 0 ? num : this.fallbackAuctionSessionCount;
  }

  toggleAsset(index: number): void {
    this.expandedAssets[index] = !this.expandedAssets[index];
  }

  formatCurrency(value: number | string | null | undefined): string {
    if (!value) return '-';
    return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  }

  goBack(): void {
    window.history.back();
  }

  goToAuctionOrgProfile(): void {
    const auctionOrgName = this.product?.auctionOrgName || '';
    const auctionLocation = this.product?.auctionLocation || this.product?.auctionOrgAddress || '';
    const contactPhone = this.product?.contactPhone || '';
    const contactEmail = this.product?.contactEmail || '';

    this.router.navigate(['/auction-org-detail'], {
      state: {
        auctionOrgName,
        auctionLocation,
        contactPhone,
        contactEmail,
        auctionSessionCount: this.auctionSessionCount,
      }
    });
  }

  private buildSimilarSearchRequest(product: MarketplaceNoticeDetail | null): AdvancedSearchRequest | null {
    if (!product?.assets?.length) return null;

    const assetCategoryId = (product.assets[0] as any)?.assetTypeCode ?? product.assets[0]?.assetType ?? undefined;

    const legalCategoryIds = (product.assets ?? [])
      .map((a: any) => a.legalCategoryCode ?? a.legalCategoryId ?? a.legalCategory)
      .map((x: any) => {
        if (typeof x === 'number') return x;
        if (typeof x === 'string' && /^\d+$/.test(x)) return Number(x);
        return null;
      })
      .filter((x: number | null): x is number => x !== null);

    return {
      page: 1,
      pageSize: 8,
      sortBy: 'newest',
      assetCategoryId: typeof assetCategoryId === 'number' ? assetCategoryId : undefined,
      legalCategoryIds: legalCategoryIds.length ? Array.from(new Set(legalCategoryIds)) : undefined
    };
  }

  private mapNoticeToSimilarProduct(item: NoticeSearchDocument): SimilarProductItem {
    return {
      id: String(item.noticeId),
      title: item.title,
      desc: `${item.provinceName || 'Không xác định'} · ${item.assetCount ?? 0} tài sản`,
      price: this.formatStartingPriceRange(item.minStartingPrice, item.maxStartingPrice),
      status: item.status,
      owner: item.auctionOrgName,
      image: this.getNoticeImageByCategoryRefId(item.firstAssetCategoryRefId),
      isLiked: item.isFavorite,
      favoriteId: item.favoriteId,
      viewCount: this.resolveViewCount(item.viewCount),
      favoriteCount: this.resolveFavoriteCount(item.favoriteCount),
    };
  }

  private formatToTy(value: number | null | undefined): string {
    if (value == null) return '—';
    if (value < 100_000_000) {
      return (value / 1_000_000).toFixed(2) + ' triệu';
    }
    return (value / 1_000_000_000).toFixed(2) + ' tỷ';
  }

  private formatStartingPriceRange(
    min: number | null | undefined,
    max: number | null | undefined
  ): string {
    const minOk = min != null && Number.isFinite(min);
    const maxOk = max != null && Number.isFinite(max);
    if (!minOk && !maxOk) {
      return '—';
    }
    if (minOk && maxOk && Number(min) === Number(max)) {
      return this.formatToTy(min);
    }
    if (minOk && maxOk) {
      return `${this.formatToTy(min)} - ${this.formatToTy(max)}`;
    }
    if (minOk) {
      return this.formatToTy(min);
    }
    return this.formatToTy(max);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'UPCOMING': return 'badge--green';
      case 'ONGOING': return 'badge--blue';
      case 'COMPLETED': return 'badge--dark';
      case 'CANCELLED': return 'badge--yellow';
      default: return 'badge--gray';
    }
  }

  getNoticeStatusLabel(status: string | undefined): string {
    if (!status) return 'Chưa rõ';
    switch (status) {
      case 'UPCOMING': return 'Mở đăng ký';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELED':
      case 'CANCELLED': return 'Huỷ đấu giá';
      default: return status;
    }
  }

  getNoticeStatusClass(status: string | undefined): string {
    if (!status) return 'badge--gray';
    switch (status) {
      case 'UPCOMING': return 'badge--green';
      case 'ONGOING': return 'badge--blue';
      case 'COMPLETED': return 'badge--dark';
      case 'CANCELED':
      case 'CANCELLED': return 'badge--yellow';
      default: return 'badge--gray';
    }
  }

  get uniqueAssetCategories(): string[] {
    if (!this.product?.assets) return [];
    const categories = new Set<string>();
    this.product.assets.forEach(a => {
      if (a.assetType || a.assetSubType) {
        categories.add(`${a.assetType || 'Chưa phân loại'} - ${a.assetSubType || 'Chưa phân loại'}`);
      }
    });
    return Array.from(categories);
  }

  get uniqueLegalCategories(): string[] {
    if (!this.product?.assets) return [];
    const set = new Set<string>();
    this.product.assets.forEach(a => {
      if (a.legalCategory) {
        set.add(a.legalCategory);
      }
    });
    return Array.from(set);
  }

  getPriceClass(status: string): string {
    if (status === 'Đang diễn ra') return 'price--blue';
    return 'price--green';
  }

  navToDetail(id: string | undefined) {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }

  toggleFavorite(item: SimilarProductItem, event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();

    let isLoggedIn = false;
    this.store.select(selectIsLoggedIn).subscribe(v => isLoggedIn = v).unsubscribe();

    if (!isLoggedIn) {
      this.logger.info('Vui lòng đăng nhập để thực hiện chức năng này!');
      return;
    }

    const noticeId = Number(item.id);
    if (!Number.isFinite(noticeId) || noticeId <= 0) return;
    item.isLiked = !item.isLiked;

    if (!item.isLiked) {
      this.userFavoriteStore.removeFavorite$({ noticeId, favoriteId: item.favoriteId });
      return;
    }

    this.userFavoriteStore.addFavorite$(noticeId);
  }

  private applyFavoriteMutationToSimilar(noticeId: number, isLiked: boolean, favoriteId?: number): void {
    this.similarProducts = (this.similarProducts ?? []).map((it) => {
      const idNum = Number(it.id);
      if (idNum !== noticeId) return it;
      return { ...it, isLiked, favoriteId: isLiked ? favoriteId : undefined };
    });
  }

  private applyFavoriteMutationToProduct(noticeId: number, isLiked: boolean, favoriteId?: number): void {
    if (!this.product || Number(this.product.id) !== noticeId) return;
    this.isProductFavorited = isLiked;
    this.productFavoriteId = isLiked ? favoriteId : undefined;
  }

  toggleProductFavorite(): void {
    if (!this.product) return;

    let isLoggedIn = false;
    this.store.select(selectIsLoggedIn).subscribe(v => isLoggedIn = v).unsubscribe();

    if (!isLoggedIn) {
      this.logger.info('Vui lòng đăng nhập để thực hiện chức năng này!');
      return;
    }

    const noticeId = Number(this.product.id);
    if (!Number.isFinite(noticeId) || noticeId <= 0) return;

    this.isProductFavorited = !this.isProductFavorited;

    if (!this.isProductFavorited) {
      this.userFavoriteStore.removeFavorite$({ noticeId, favoriteId: this.productFavoriteId });
      return;
    }

    this.userFavoriteStore.addFavorite$(noticeId);
  }

  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  draggedElement: HTMLElement | null = null;

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.pageX;
    this.draggedElement = e.currentTarget as HTMLElement;
    this.scrollLeft = this.draggedElement.scrollLeft;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging || !this.draggedElement) return;

    const x = e.pageX;
    const walk = x - this.startX;

    this.draggedElement.scrollLeft = this.scrollLeft - walk;
  }

  onMouseUp() {
    this.isDragging = false;
    this.draggedElement = null;
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

  private startCountdown(docSaleEnd: string): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const endTime = new Date(docSaleEnd).getTime();

    this.updateCountdown(endTime);

    this.timerInterval = setInterval(() => {
      this.updateCountdown(endTime);
    }, 1000);
  }

  private updateCountdown(endTime: number): void {
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance <= 0) {
      this.countdownDays = '0';
      this.countdownHours = '00';
      this.countdownMinutes = '00';
      this.countdownSeconds = '00';
      this.isDocSaleExpired = true;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      return;
    }

    this.isDocSaleExpired = false;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.countdownDays = days.toString();
    this.countdownHours = hours < 10 ? '0' + hours : hours.toString();
    this.countdownMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
    this.countdownSeconds = seconds < 10 ? '0' + seconds : seconds.toString();
  }

  private randomInt(min: number, max: number): number {
    const a = Math.ceil(min);
    const b = Math.floor(max);
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  registerForAuction() {
    //this.toastService.success('Đăng ký tham gia đấu giá thành công');
    //this.toastService.error('Đăng ký tham gia đấu giá thành công');
    //this.toastService.info('Đăng ký tham gia đấu giá thành công', 'Thông báo!');
  }
  private getNoticeImageByCategoryRefId(refId?: string): string {
    if (!refId) {
      return this.defaultNoticeImage;
    }

    const normalizedRefId = refId.trim().toUpperCase();
    return this.categoryImageByRefId[normalizedRefId] ?? this.defaultNoticeImage;
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

interface SimilarProductItem {
  id: string;
  title: string;
  desc: string;
  price: string;
  status: string;
  owner: string;
  image: string;
  isLiked: boolean;
  favoriteId?: number;
  viewCount: number;
  favoriteCount: number;
}
